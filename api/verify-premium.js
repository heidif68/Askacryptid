import { createPremiumCookie } from './_lib/premium.js';

// Where the Stripe Payment Link's "after payment" redirect should point:
// https://<your-domain>/api/verify-premium?session_id={CHECKOUT_SESSION_ID}
const SITE_REDIRECT = '/';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = req.query?.session_id;
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=subscription`,
      {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      }
    );

    if (!response.ok) {
      // Log Stripe's actual error (e.g. "No such checkout.session" when a live
      // session is looked up with a test key). Only the id prefix and key mode
      // are logged, never the full session id or the secret key.
      const stripeBody = await response.text().catch(() => '');
      console.error('Stripe session lookup failed:', {
        httpStatus: response.status,
        stripeBody,
        sessionIdPrefix: sessionId.slice(0, 8),
        keyMode: (process.env.STRIPE_SECRET_KEY || '').slice(0, 8) || 'MISSING',
      });
      return res.status(402).json({ error: 'Could not verify payment' });
    }

    const session = await response.json();

    const paid = session.payment_status === 'paid';
    // Payment Links for this product run in subscription mode; make sure the
    // subscription itself is active, not just that checkout completed once.
    const subscriptionActive =
      session.mode !== 'subscription' || ['active', 'trialing'].includes(session.subscription?.status);

    if (!paid || session.status !== 'complete' || !subscriptionActive) {
      console.error('Payment not confirmed:', {
        payment_status: session.payment_status,
        status: session.status,
        mode: session.mode,
        subscriptionStatus: session.subscription?.status,
        paid,
        subscriptionActive,
      });
      return res.status(402).json({ error: 'Payment not confirmed' });
    }

    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const cookie = createPremiumCookie(customerId || sessionId);

    res.setHeader('Set-Cookie', cookie);
    res.writeHead(302, { Location: SITE_REDIRECT });
    res.end();
  } catch (error) {
    console.error('Premium verification failed:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
}
