import { vi } from 'vitest';

// Unit tests must never send SDK telemetry into the production database.
vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 200 })));
