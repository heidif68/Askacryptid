import { kv } from '@vercel/kv';

const FREE_DAILY_LIMIT = 3;

function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function todayKey(ip) {
  const today = new Date().toISOString().slice(0, 10);
  return `questions:${ip}:${today}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const ip = getIP(req);
  const key = todayKey(ip);
  const count = (await kv.get(key)) || 0;
  res.status(200).json({
    questionsUsed: count,
    questionsLeft: Math.max(0, FREE_DAILY_LIMIT - count),
    limit: FREE_DAILY_LIMIT,
    limitReached: count >= FREE_DAILY_LIMIT,
  });
}
