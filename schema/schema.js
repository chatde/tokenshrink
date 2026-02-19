const { pgTable, text, integer, timestamp, real, varchar, uniqueIndex } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');

const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  provider: text('provider').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  plan: text('plan').notNull().default('free'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  keyHash: text('key_hash').notNull(),
  keyPrefix: varchar('key_prefix', { length: 12 }).notNull(),
  label: text('label').notNull().default('Default'),
  lastUsedAt: timestamp('last_used_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const compressions = pgTable('compressions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id),
  originalWords: integer('original_words').notNull(),
  compressedWords: integer('compressed_words').notNull(),
  rosettaWords: integer('rosetta_words').notNull().default(0),
  ratio: real('ratio').notNull(),
  strategy: text('strategy').notNull(),
  tokensSaved: integer('tokens_saved').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id).unique(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  status: text('status').notNull(),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const usageMeters = pgTable('usage_meters', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  period: varchar('period', { length: 7 }).notNull(),
  wordsProcessed: integer('words_processed').notNull().default(0),
  compressionCount: integer('compression_count').notNull().default(0),
  tokensSaved: integer('tokens_saved').notNull().default(0),
  dollarsSaved: real('dollars_saved').notNull().default(0),
}, (table) => [
  uniqueIndex('usage_user_period_idx').on(table.userId, table.period),
]);

module.exports = { users, apiKeys, compressions, subscriptions, usageMeters };
