import { consumeLoginToken } from './_lib/loginToken.js';
import { refreshCustomerPremium } from './_lib/stripeSubscription.js';
import { createPremiumCookie } from './_lib/premium.js';

// Redeems a single-use sign-in token from the emailed link. This is a POST
// (fired by the button on /login) rather than a GET on the link itself, so
// email security scanners that pre-open links can't use the token up.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  let customerId;
  try {
    customerId = await consumeLoginToken(req.body?.token);
  } catch (err) {
    console.error('Login token redemption failed:', err);
    return res.status(503).json({ error: 'Sign-in is not available right now. Please try again.' });
  }

  if (!customerId) {
    return res.status(400).json({
      error: 'This sign-in link has expired or was already used. Please request a new one.',
    });
  }

  let premium;
  try {
    // Fresh check against Stripe, not the cache.
    premium = await refreshCustomerPremium(customerId);
  } catch (err) {
    console.error('Stripe check at login failed:', err.status, err.body || err.message);
    return res.status(502).json({
      error: 'We could not reach our payment provider. Please request a new link and try again.',
    });
  }

  if (!premium) {
    return res.status(403).json({ error: 'We could not find an active subscription for this account.' });
  }

  res.setHeader('Set-Cookie', createPremiumCookie(customerId));
  res.status(200).json({ ok: true });
}
