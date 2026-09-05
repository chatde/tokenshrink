// Accounts are linked by email, so a provider must prove ownership before sign-in.
export async function verifiedIdentity({ user, account, profile }, fetcher = fetch) {
  if (typeof user?.email !== 'string' || !user.email) return false;
  if (account?.provider === 'google') return profile?.email_verified === true;
  if (account?.provider !== 'github' || !account.access_token) return false;
  try {
    const response = await fetcher('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${account.access_token}`, Accept: 'application/vnd.github+json' },
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;
    const emails = await response.json();
    return Array.isArray(emails) && emails.some(entry => entry.verified === true
      && typeof entry.email === 'string' && entry.email.toLowerCase() === user.email.toLowerCase());
  } catch { return false; }
}
