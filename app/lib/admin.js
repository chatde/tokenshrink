import { auth } from '@/app/lib/auth';
export function isAdminEmail(email) {
  const allowed = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return typeof email === 'string' && allowed.includes(email.toLowerCase());
}
export async function requireAdmin() {
  const session = await auth();
  return session?.user?.id && isAdminEmail(session.user.email) ? session : null;
}
