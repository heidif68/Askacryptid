import { kv } from '@vercel/kv';

// Stripe is the source of truth for who is premium. Results are cached in KV
// for a few minutes so /api/ask and /api/status don't call Stripe on every
// request. A subscription cancelled "at period end" stays `active` in Stripe
// until the period actually ends, so access lasts exactly as long as it's paid.

const ACTIVE_STATUSES = new Set(['active', 'trialing']);
const CACHE_SECONDS = 10 * 60;
// If Stripe is unreachable when the cache has expired, trust a "yes" that was
// confirmed within this window rather than locking paying customers out.
const STALE_GRACE_SECONDS = 24 * 60 * 60;
// Upper bound on Stripe lookups per email (several customers can share one).
const MAX_CANDIDATE_CUSTOMERS = 10;

let store = kv;
// Test seam: lets tests swap in an in-memory store.
export function _setStoreForTests(fake) {
  store = fake;
}

const cacheKey = (customerId) => `askacryptid:premium:${customerId}`;
const lastGoodKey = (customerId) => `askacryptid:premium-last-good:${customerId}`;

// STRIPE_PREMIUM_PRICE_IDS: optional comma-separated price ids that grant
// premium. When unset, any active subscription on the account counts (which is
// how verify-premium.js already behaves).
function premiumPriceIds() {
  const raw = process.env.STRIPE_PREMIUM_PRICE_IDS;
  if (!raw) return null;
  const ids = raw.split(',').map((id) => id.trim()).filter(Boolean);
  return ids.length ? new Set(ids) : null;
}

export function subscriptionGrantsPremium(subscription) {
  if (!subscription || !ACTIVE_STATUSES.has(subscription.status)) return false;
  const priceIds = premiumPriceIds();
  if (!priceIds) return true;
  return (subscription.items?.data || []).some((item) => priceIds.has(item.price?.id));
}

export function escapeSearchValue(value) {
  return value.replace(/\/g, '\\').replace(/"/g, '\\"');
}

async function stripeGet(path, params) {
  const response = await fetch(`https://api.stripe.com/v1/${path}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
  });
  if (!response.ok) {
    const error = new Error(`Stripe GET /${path} failed with ${response.status}`);
    error.status = response.status;
    error.body = await response.text().catch(() => '');
    throw error;
  }
  return response.json();
}

async function writeCache(customerId, premium) {
  try {
    await store.set(cacheKey(customerId), premium ? 'yes' : 'no', { ex: CACHE_SECONDS });
    if (premium) {
      await store.set(lastGoodKey(customerId), 'yes', { ex: STALE_GRACE_SECONDS });
    } else {
      // Stripe confirmed there is no active subscription: a later Stripe
      // outage must not resurrect access.
      await store.del(lastGoodKey(customerId));
    }
  } catch (err) {
    console.error('Premium cache write failed:', err);
  }
}

// Always asks Stripe (bypasses the cache), then refreshes the cache. Throws if
// Stripe can't be reached. Used at login time, where a fresh answer matters.
export async function refreshCustomerPremium(customerId) {
  const subscriptions = await stripeGet('subscriptions', {
    customer: customerId,
    status: 'all',
    limit: '100',
  });
  const premium = (subscriptions.data || []).some(subscriptionGrantsPremium);
  await writeCache(customerId, premium);
  return premium;
}

// Cached check used on every gated request. Fails closed, except for the
// stale-if-error grace described above.
export async function isCustomerPremium(customerId) {
  if (typeof customerId !== 'string' || !customerId.startsWith('cus_')) return false;

  try {
    const cached = await store.get(cacheKey(customerId));
    if (cached === 'yes') return true;
    if (cached === 'no') return false;
  } catch (err) {
    console.error('Premium cache read failed:', err);
  }

  try {
    return await refreshCustomerPremium(customerId);
  } catch (err) {
    console.error('Stripe subscription check failed:', err.status, err.body || err.message);
    try {
      return (await store.get(lastGoodKey(customerId))) === 'yes';
    } catch {
      return false;
    }
  }
}

async function listCustomerIdsByEmail(email) {
  const ids = new Set();
  // Stripe's list-by-email filter is case-sensitive.
  for (const variant of new Set([email, email.toLowerCase()])) {
    const customers = await stripeGet('customers', { email: variant, limit: '10' });
    for (const customer of customers.data || []) ids.add(customer.id);
  }
  return ids;
}

// Search is case-insensitive but can lag a little behind brand-new customers,
// so it's a fallback rather than the primary lookup.
async function searchCustomerIdsByEmail(email) {
  try {
    const result = await stripeGet('customers/search', {
      query: `email:"${escapeSearchValue(email)}"`,
      limit: '10',
    });
    return (result.data || []).map((customer) => customer.id);
  } catch (err) {
    console.error('Stripe customer search failed:', err.status, err.message);
    return [];
  }
}

// Returns the id of a customer with this email who has an active premium
// subscription, or null. Throws if Stripe can't be reached.
export async function findPremiumCustomerByEmail(email) {
  const checked = new Set();

  const firstPremium = async (ids) => {
    for (const id of ids) {
      if (checked.has(id)) continue;
      if (checked.size >= MAX_CANDIDATE_CUSTOMERS) return null;
      checked.add(id);
      if (await refreshCustomerPremium(id)) return id;
    }
    return null;
  };

  const fromList = await firstPremium(await listCustomerIdsByEmail(email));
  if (fromList) return fromList;
  return firstPremium(await searchCustomerIdsByEmail(email));
}
