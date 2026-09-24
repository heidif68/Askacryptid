import { getQuestionStatus, getClientIp, FREE_DAILY_LIMIT } from './_lib/rateLimit.js';
import { isPremiumRequest } from './_lib/premium.js';
import { isOwnerBypass } from './_lib/ownerBypass.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isPremium = await isPremiumRequest(req);
  const isOwner = isOwnerBypass(req);

  if (isPremium || isOwner) {
    return res.status(200).json({
      isPremium,
      isOwner,
      questionsUsed: 0,
      questionsLeft: FREE_DAILY_LIMIT,
      limit: FREE_DAILY_LIMIT,
      limitReached: false,
    });
  }

  const ip = getClientIp(req);
  const status = await getQuestionStatus(ip);
  res.status(200).json({ isPremium: false, isOwner: false, ...status });
}
