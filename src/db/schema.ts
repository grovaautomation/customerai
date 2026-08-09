import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Campaign Status Enum
export const campaignStatusEnum = pgEnum('campaign_status', [
  'QUEUED',
  'SEARCHING',
  'VALIDATING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

// Validation Status Enum
export const validationStatusEnum = pgEnum('validation_status', [
  'PENDING',
  'VALID',
  'INVALID',
  'ERROR',
]);

// Connector Status Enum
export const connectorStatusEnum = pgEnum('connector_status', [
  'DISCONNECTED',
  'CONNECTING',
  'CONNECTED',
  'ERROR',
]);

// Campaigns Table
export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  keyword: varchar('keyword', { length: 255 }).notNull(),
  region: varchar('region', { length: 255 }).notNull(),
  targetLeads: integer('target_leads').notNull(),
  status: campaignStatusEnum('status').notNull().default('QUEUED'),

  // Counters
  candidatesFound: integer('candidates_found').default(0),
  validatedCount: integer('validated_count').default(0),
  validCount: integer('valid_count').default(0),
  invalidCount: integer('invalid_count').default(0),
  duplicateCount: integer('duplicate_count').default(0),

  // Timestamps
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Leads Table
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessName: varchar('business_name', { length: 500 }),
  phone: varchar('phone', { length: 50 }),
  normalizedPhone: varchar('normalized_phone', { length: 50 }),
  address: text('address'),
  region: varchar('region', { length: 255 }),
  category: varchar('category', { length: 255 }),
  website: varchar('website', { length: 500 }),
  email: varchar('email', { length: 255 }),
  instagram: varchar('instagram', { length: 255 }),
  source: varchar('source', { length: 100 }),
  sourceReference: varchar('source_reference', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Campaign Leads Junction Table
export const campaignLeads = pgTable('campaign_leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }).notNull(),
  validationStatus: validationStatusEnum('validation_status').default('PENDING'),
  validationAttempts: integer('validation_attempts').default(0),
  validatedAt: timestamp('validated_at'),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Validation Logs Table
export const validationLogs = pgTable('validation_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
  phone: varchar('phone', { length: 50 }),
  result: validationStatusEnum('result'),
  error: text('error'),
  attempt: integer('attempt').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// Connectors Table
export const connectors = pgTable('connectors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  status: connectorStatusEnum('status').default('DISCONNECTED'),
  connectionStatus: varchar('connection_status', { length: 50 }),
  accountIdentifier: varchar('account_identifier', { length: 255 }),
  lastCheckedAt: timestamp('last_checked_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Better Auth Tables (Required for authentication)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: integer('email_verified').default(0),
  image: varchar('image', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  ipAddress: varchar('ip_address', { length: 255 }),
  userAgent: varchar('user_agent', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Type exports
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type CampaignLead = typeof campaignLeads.$inferSelect;
export type ValidationLog = typeof validationLogs.$inferSelect;
export type Connector = typeof connectors.$inferSelect;

export type CampaignStatus = 'QUEUED' | 'SEARCHING' | 'VALIDATING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ValidationStatus = 'PENDING' | 'VALID' | 'INVALID' | 'ERROR';
