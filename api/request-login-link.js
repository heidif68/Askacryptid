import crypto from 'crypto';
import { getClientIp, isRateLimited } from './_lib/rateLimit.js';
import { findPremiumCustomerByEmail } from './_lib/stripeSubscription.js';
import { createLoginToken, LOGIN_TOKEN_TTL_SECONDS } from './_lib/loginToken.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOUR_SECONDS = 60 * 60;
const MAX_PER_IP_PER_HOUR = 10;
const MAX_PER_EMAIL_PER_HOUR = 5;
// Every successful request takes at least this long, so response time doesn't
// reveal whether the email belongs to a subscriber (the "found" path does extra
// Stripe/KV/Resend work).
const MIN_RESPONSE_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendLoginEmail(to, link) {
  const minutes = LOGIN_TOKEN_TTL_SECONDS / 60;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      // RESEND_FROM_EMAIL must be on a domain verified in Resend to reach
      // anyone other than the Resend account owner.
      from: process.env.RESEND_FROM_EMAIL || 'Ask a Cryptid <onboarding@resend.dev>',
      to,
      subject: 'Your Ask a Cryptid sign-in link',
      html: `
        <div style="font-family: Georgia, serif; color: #222; max-width: 480px;">
          <p>Here is your sign-in link for Ask a Cryptid:</p>
          <p><a href="${link}" style="color: #8a6d00;">Sign in and restore premium access</a></p>
          <p>This link works once and expires in ${minutes} minutes. If you didn't ask for it, you can safely ignore this email.</p>
        </div>
      `,
      text: `Sign in to Ask a Cryptid and restore premium access:\n\n${link}\n\nThis link works once and expires in ${minutes} minutes. If you didn't ask for it, ignore this email.`,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend responded with ${response.status}: ${await response.text().catch(() => '')}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Links are built from a fixed origin, never from the request's Host header.
  const siteUrl = (process.env.SITE_URL || '').replace(/\/+$/, '');
  if (!siteUrl) {
    console.error('SITE_URL is not configured; cannot send sign-in links');
    return res.status(500).json({ error: 'Email sign-in is not available right now.' });
  }

  // Every request counts toward the limits whether or not the email belongs to
  // a subscriber, so a 429 doesn't leak anything either.
  try {
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
    const ipLimited = await isRateLimited(
      `askacryptid:loginreq:ip:${getClientIp(req)}`,
      MAX_PER_IP_PER_HOUR,
      HOUR_SECONDS
    );
    const emailLimited =
      !ipLimited &&
      (await isRateLimited(`askacryptid:loginreq:email:${emailHash}`, MAX_PER_EMAIL_PER_HOUR, HOUR_SECONDS));
    if (ipLimited || emailLimited) {
      return res.status(429).json({ error: 'Too many requests. Please try again in a little while.' });
    }
  } catch (err) {
    console.error('Login link rate limit check failed:', err);
    return res.status(503).json({ error: 'Email sign-in is not available right now.' });
  }

  const started = Date.now();
  try {
    const customerId = await findPremiumCustomerByEmail(email);
    if (customerId) {
      const token = await createLoginToken(customerId);
      await sendLoginEmail(email, `${siteUrl}/login?token=${token}`);
    }
  } catch (err) {
    // Deliberately not logging the email address or the token.
    console.error('Login link request failed:', err.status || '', err.message);
  }

  const remaining = MIN_RESPONSE_MS - (Date.now() - started);
  if (remaining > 0) await sleep(remaining);

  res.status(200).json({ ok: true });
}
