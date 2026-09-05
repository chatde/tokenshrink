import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/admin';
import { db } from '@/app/lib/db';
import { sql } from 'drizzle-orm';
import { FEEDBACK_STATUSES } from '@/app/lib/feedback-input';
import { isSameOrigin, readJsonLimited, RequestError } from '@/app/lib/request-safety';
export async function PATCH(request, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid feedback ID' }, { status: 400 });
  let body;
  try { body = await readJsonLimited(request); } catch (error) { return NextResponse.json({ error: 'Invalid JSON' }, { status: error instanceof RequestError ? error.status : 400 }); }
  if (!body || !FEEDBACK_STATUSES.includes(body.status) || typeof body.resolution !== 'string' || body.resolution.length > 2000 || (body.status === 'resolved' && !body.resolution.trim())) {
    return NextResponse.json({ error: 'Select a status and include a resolution when resolving feedback.' }, { status: 400 });
  }
  try {
    const result = await db.execute(sql`UPDATE feedback SET status=${body.status}, resolution=${body.resolution.trim()}, updated_at=now() WHERE id=${id} RETURNING id`);
    if (!result.rows.length) return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Could not save feedback status' }, { status: 503 }); }
}
