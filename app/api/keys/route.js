import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { apiKeys } from '@/schema/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { createHash, randomBytes } from 'crypto';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keys = await db
    .select({
      id: apiKeys.id,
      keyPrefix: apiKeys.keyPrefix,
      label: apiKeys.label,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, session.user.id), isNull(apiKeys.revokedAt)));

  return NextResponse.json({ keys });
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { label } = await request.json();

  // Generate key: ts_live_<32 random hex chars>
  const rawKey = `ts_live_${randomBytes(16).toString('hex')}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.slice(0, 12);

  await db.insert(apiKeys).values({
    userId: session.user.id,
    keyHash,
    keyPrefix,
    label: label || 'Default',
  });

  // Return the raw key ONCE — we only store the hash
  return NextResponse.json({ key: rawKey, prefix: keyPrefix });
}

export async function DELETE(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, session.user.id)));

  return NextResponse.json({ revoked: true });
}
