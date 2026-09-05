const { pgTable, text, integer, timestamp, real, varchar, uniqueIndex, index, bigint } = require('drizzle-orm/pg-core');
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
}, (table) => [
  index('api_keys_key_hash_idx').on(table.keyHash),
]);

const compressions = pgTable('compressions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id),
  originalWords: integer('original_words').notNull(),
  compressedWords: integer('compressed_words').notNull(),
  rosettaWords: integer('rosetta_words').notNull().default(0),
  ratio: real('ratio').notNull(),
  strategy: text('strategy').notNull(),
  tokensSaved: integer('tokens_saved').notNull().default(0),
  originalTokens: integer('original_tokens').notNull().default(0),
  compressedTokens: integer('compressed_tokens').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('compressions_user_created_idx').on(table.userId, table.createdAt),
]);

const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id).unique(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  lastStripeEventCreated: integer('last_stripe_event_created').notNull().default(0),
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

const rateLimits = pgTable('rate_limits', {
  id: text('id').primaryKey(),
  count: integer('count').notNull().default(0),
  expiresAt: timestamp('expires_at').notNull(),
}, (table) => [
  index('rate_limits_expires_idx').on(table.expiresAt),
]);

const analyticsEvents = pgTable('analytics_events', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  event: text('event').notNull(),
  beforeTokens: integer('before_tokens').notNull(),
  afterTokens: integer('after_tokens').notNull(),
  savedTokens: integer('saved_tokens').notNull(),
  source: varchar('source', { length: 64 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => [index('analytics_events_created_idx').on(table.createdAt)]);

const stripeWebhookEvents = pgTable('stripe_webhook_events', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const feedback = pgTable('feedback', {
  id: text('id').primaryKey(), category: text('category').notNull(), message: text('message').notNull(),
  status: text('status').notNull().default('new'), summary: text('summary'), resolution: text('resolution').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(), updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, table => [index('feedback_created_idx').on(table.createdAt)]);

module.exports = { feedback, analyticsEvents, stripeWebhookEvents, users, apiKeys, compressions, subscriptions, usageMeters, rateLimits };
