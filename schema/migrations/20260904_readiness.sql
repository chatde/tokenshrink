-- Additive, repeatable migration. No existing records are deleted or rewritten.
CREATE TABLE IF NOT EXISTS analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event text NOT NULL CHECK (event IN ('compress', 'compressHistory')),
  before_tokens integer NOT NULL CHECK (before_tokens BETWEEN 0 AND 2000000),
  after_tokens integer NOT NULL CHECK (after_tokens BETWEEN 0 AND before_tokens),
  saved_tokens integer NOT NULL CHECK (saved_tokens = before_tokens - after_tokens),
  source varchar(64) NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON analytics_events(created_at);
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id text PRIMARY KEY,
  created_at timestamp NOT NULL DEFAULT now()
);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_stripe_event_created integer NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS feedback (
  id text PRIMARY KEY,
  category text NOT NULL CHECK (category IN ('bug','idea','question','other')),
  message text NOT NULL CHECK (length(message) BETWEEN 10 AND 2000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewing','planned','resolved')),
  summary text,
  resolution text NOT NULL DEFAULT '',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS feedback_created_idx ON feedback(created_at);
