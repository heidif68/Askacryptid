import crypto from 'crypto';

// Lets the site owner test without burning the free daily limit. The owner
// visits the site once with ?owner_key=<OWNER_BYPASS_SECRET>, the frontend
// stashes it in localStorage, and it's sent back as a header on every API
// call. No bypass is possible unless OWNER_BYPASS_SECRET is set.
export function isOwnerBypass(req) {
  const secret = process.env.OWNER_BYPASS_SECRET;
  if (!secret) return false;

  const provided = req.headers['x-owner-key'];
  if (!provided || typeof provided !== 'string') return false;

  const providedBuf = Buffer.from(provided);
  const secretBuf = Buffer.from(secret);
  if (providedBuf.length !== secretBuf.length) return false;

  return crypto.timingSafeEqual(providedBuf, secretBuf);
}
