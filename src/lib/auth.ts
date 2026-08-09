import { getSession } from 'better-auth/auth';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const session = await getSession(auth);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return session;
}

export async function getCurrentUser() {
  try {
    const session = await getSession(auth);
    return session?.user ?? null;
  } catch {
    return null;
  }
}
