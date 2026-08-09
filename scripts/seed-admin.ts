import 'dotenv/config';
import { db } from '../src/db';
import { users, accounts } from '../src/db/schema';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_USERNAME!;
  const adminPassword = process.env.ADMIN_PASSWORD!;

  console.log('Seeding admin user...');
  console.log('Email:', adminEmail);

  // Check if admin already exists
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, adminEmail),
  });

  if (existingUser) {
    console.log('Admin user already exists, updating password...');

    // Update password in accounts table
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await db
      .update(accounts)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where((accounts, { eq, and }) =>
        and(eq(accounts.userId, existingUser.id), eq(accounts.providerId, 'credential'))
      );

    console.log('Admin password updated successfully!');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const [newUser] = await db
    .insert(users)
    .values({
      email: adminEmail,
      name: 'Admin',
      emailVerified: 1,
    })
    .returning();

  console.log('Admin user created:', newUser.id);

  // Create account with credentials
  await db.insert(accounts).values({
    userId: newUser.id,
    accountId: adminEmail,
    providerId: 'credential',
    password: hashedPassword,
  });

  console.log('Admin credentials created successfully!');
  console.log('Username:', adminEmail);
  console.log('Password:', adminPassword);
}

seedAdmin()
  .catch(console.error)
  .finally(() => process.exit(0));
