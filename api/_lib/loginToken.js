import crypto from 'crypto';
import { kv } from '@vercel/kv';

export const LOGIN_TOKEN_TTL_SECONDS = 15 * 60;

// 32 random bytes as base64url is always 43 characters.
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

let store = kv;
// Test seam: lets tests swap in an in-memory store.
export function _setStoreForTests(fake) {
  store = fake;
}

// Only a hash of the token is stored, so a KV leak doesn't expose live links.
function tokenKey(token) {
  return `askacryptid:login:${crypto.createHash('sha256').update(token).digest('hex')}`;
}

export async function createLoginToken(customerId) {
  const token = crypto.randomBytes(32).toString('base64url');
  await store.set(tokenKey(token), { customerId }, { ex: LOGIN_TOKEN_TTL_SECONDS });
  return token;
}

// Single use: GETDEL reads and deletes in one atomic step, so two concurrent
// requests can never both redeem the same token.
export async function consumeLoginToken(token) {
  if (typeof token !== 'string' || !TOKEN_RE.test(token)) return null;
  const record = await store.getdel(tokenKey(token));
  return record?.customerId ?? null;
}
