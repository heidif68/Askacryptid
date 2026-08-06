import crypto from 'crypto';

export const PREMIUM_COOKIE_NAME = 'askacryptid_premium';

// Matches the monthly billing cycle. There's no webhook wired up yet to
// revoke this immediately on cancellation/chargeback — see verify-premium.js.
const PREMIUM_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function getSecret() {
  const secret = process.env.PREMIUM_COOKIE_SECRET;
  if (!secret) throw new Error('PREMIUM_COOKIE_SECRET is not configured');
  return secret;
}

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createPremiumCookie(customerId) {
  const payload = JSON.stringify({
    sub: customerId,
    exp: Date.now() + PREMIUM_COOKIE_MAX_AGE_SECONDS * 1000,
  });
  const encoded = Buffer.from(payload, 'utf8').toString('base64url');
  const signature = sign(encoded);
  const value = `${encoded}.${signature}`;
  return `${PREMIUM_COOKIE_NAME}=${value}; Path=/; Max-Age=${PREMIUM_COOKIE_MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

export function parseCookies(req) {
  const header = req.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

export function isPremiumRequest(req) {
  try {
    const cookies = parseCookies(req);
    const value = cookies[PREMIUM_COOKIE_NAME];
    if (!value) return false;

    const [encoded, signature] = value.split('.');
    if (!encoded || !signature) return false;

    const expected = sign(encoded);
    const signatureBuf = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    if (signatureBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(signatureBuf, expectedBuf)) {
      return false;
    }

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}
