import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { neon } from '@neondatabase/serverless';
const env = parseEnv(readFileSync('.env.production.local', 'utf8'));
const sql = neon(env.DATABASE_URL);
const statements = readFileSync(new URL('../schema/migrations/20260904_readiness.sql', import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean);
await sql.transaction(statements.map(statement=>sql.query(statement)));
console.log('Readiness migration applied atomically.');
console.log(await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('analytics_events','stripe_webhook_events','feedback') ORDER BY table_name`);
