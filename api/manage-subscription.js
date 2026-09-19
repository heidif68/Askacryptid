import { getPremiumCustomerId } from './_lib/premium.js';

// Sends a subscriber to their Stripe customer portal to update payment details
// or cancel. The Stripe customer id comes from the signed premium cookie set in
// verify-premium.js, so a visitor can only ever open their own portal.
//
// Requires the customer portal to be enabled in the Stripe Dashboard
// (Settings > Billing > Customer portal) with cancellation turned on.
//
// Optional: set STRIPE_PORTAL_LOGIN_URL to the portal's shareable login link
// (billing.stripe.com/p/login/...) so subscribers without a valid cookie
// (new device, expired cookie) can still sign in with their email.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const customerId = getPremiumCustomerId(req);

  if (!customerId) {
    const loginUrl = process.env.STRIPE_PORTAL_LOGIN_URL;
    if (loginUrl) {
      res.writeHead(302, { Location: loginUrl });
      return res.end();
    }
    return res.status(401).json({
      error: 'No active subscription found on this browser. Use the contact form and we will help you manage it.',
    });
  }

  try {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const returnUrl = `${proto}://${req.headers.host}/`;

    const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ customer: customerId, return_url: returnUrl }),
    });

    if (!response.ok) {
      console.error('Stripe portal session failed:', response.status, await response.text());
      return res.status(502).json({ error: 'Could not open the subscription portal' });
    }

    const session = await response.json();
    res.writeHead(302, { Location: session.url });
    res.end();
  } catch (error) {
    console.error('Manage subscription failed:', error);
    res.status(500).json({ error: 'Could not open the subscription portal' });
  }
}
