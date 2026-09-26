import { kv } from '@vercel/kv';

export const FREE_DAILY_LIMIT = 3;

const SECONDS_PER_DAY = 86400;

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function dailyKey(ip) {
  const today = new Date().toISOString().slice(0, 10);
  return `askacryptid:questions:${ip}:${today}`;
}

// Atomic INCR avoids the read-then-write race of the previous get/set
// implementation, where two concurrent requests could both read the same
// count and both be allowed through.
export async function consumeQuestion(ip) {
  const key = dailyKey(ip);
  try {
    const count = await kv.incr(key);
    if (count === 1) {
      await kv.expire(key, SECONDS_PER_DAY);
    }
    return {
      allowed: count <= FREE_DAILY_LIMIT,
      questionsUsed: Math.min(count, FREE_DAILY_LIMIT),
      limit: FREE_DAILY_LIMIT,
    };
  } catch (err) {
    // If Redis is unreachable, fail open rather than taking the whole app
    // down — an indie project would rather eat a temporary cost spike than
    // block every free user during a KV outage.
    console.error('Rate limit check failed, allowing request:', err);
    return { allowed: true, questionsUsed: 0, limit: FREE_DAILY_LIMIT, degraded: true };
  }
}

export async function getQuestionStatus(ip) {
  const key = dailyKey(ip);
  try {
    const count = (await kv.get(key)) || 0;
    return {
      questionsUsed: count,
      questionsLeft: Math.max(0, FREE_DAILY_LIMIT - count),
      limit: FREE_DAILY_LIMIT,
      limitReached: count >= FREE_DAILY_LIMIT,
    };
  } catch (err) {
    console.error('Rate limit status check failed:', err);
    return {
      questionsUsed: 0,
      questionsLeft: FREE_DAILY_LIMIT,
      limit: FREE_DAILY_LIMIT,
      limitReached: false,
      degraded: true,
    };
  }
}

// Generic fixed-window limiter. Returns true when the caller is over the
// limit. SET NX EX creates the key with its expiry atomically, then INCR keeps
// that TTL, so a crash between two calls can never leave a counter that never
// expires. Unlike the question limiter this throws if KV is down: callers use
// it to protect email sending, which must not fail open.
export async function isRateLimited(key, limit, windowSeconds) {
  await kv.set(key, 0, { ex: windowSeconds, nx: true });
  const count = await kv.incr(key);
  return count > limit;
}
