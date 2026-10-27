// Deliberately simple: catches obvious typos without rejecting valid but unusual addresses.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const LINKEDIN_RE = /^https:\/\/(www\.)?linkedin\.com\/\S+$/i;

export const str = (v) => (typeof v === 'string' ? v.trim() : '');

// Every validation failure uses the same { error, fields } shape so the client can
// render messages under the matching inputs.
export function fieldError(res, fields) {
  return res.status(400).json({ error: 'Please fix the highlighted fields', fields });
}
