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

async function kvSet(key, value, exSeconds) {
  const url = `${process.env.KV_REST_API_URL}/set/${key}/${value}?ex=${exSeconds}`;
  await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { system, messages } = req.body;
  const ip = getIP(req);
  const key = todayKey(ip);
  const count = await kvGet(key);

  if (count >= FREE_DAILY_LIMIT) {
    return res.status(429).json({
      error: 'daily_limit_reached',
      questionsUsed: count,
      limit: FREE_DAILY_LIMIT,
    });
  }

  await kvSet(key, count + 1, 86400);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages,
      }),
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'API call failed' });
  }
};
