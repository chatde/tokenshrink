export const FEEDBACK_STATUSES = ['new', 'reviewing', 'planned', 'resolved'];
export const FEEDBACK_CATEGORIES = ['bug', 'idea', 'question', 'other'];
export function validateFeedback(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (typeof body.message !== 'string' || body.message.trim().length < 10 || body.message.length > 2000) return null;
  if (!FEEDBACK_CATEGORIES.includes(body.category)) return null;
  return { message: body.message.trim(), category: body.category };
}
