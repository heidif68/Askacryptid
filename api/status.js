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

async function kvGet(key) {
  const url = `${process.env.KV_REST_API_URL}/get/${key}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
  });
  const data = await res.json();
  return data.result ? parseInt(data.result) : 0;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const ip = getIP(req);
  const key = todayKey(ip);
  const count = await kvGet(key);
  res.status(200).json({
    questionsUsed: count,
    questionsLeft: Math.max(0, FREE_DAILY_LIMIT - count),
    limit: FREE_DAILY_LIMIT,
    limitReached: count >= FREE_DAILY_LIMIT,
  });
};
