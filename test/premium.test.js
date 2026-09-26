import { test, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  subscriptionGrantsPremium,
  escapeSearchValue,
  isCustomerPremium,
  _setStoreForTests as setSubscriptionStore,
} from '../api/_lib/stripeSubscription.js';
import {
  createLoginToken,
  consumeLoginToken,
  _setStoreForTests as setTokenStore,
} from '../api/_lib/loginToken.js';

function fakeStore() {
  const data = new Map();
  return {
    data,
    async get(key) {
      return data.has(key) ? data.get(key) : null;
    },
    async set(key, value, options) {
      if (options?.nx && data.has(key)) return null;
      data.set(key, value);
      return 'OK';
    },
    async del(key) {
      data.delete(key);
    },
    async getdel(key) {
      const value = data.has(key) ? data.get(key) : null;
      data.delete(key);
      return value;
    },
  };
}

const realFetch = globalThis.fetch;
let store;

beforeEach(() => {
  store = fakeStore();
  setSubscriptionStore(store);
  setTokenStore(store);
  delete process.env.STRIPE_PREMIUM_PRICE_IDS;
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
  mock.method(console, 'error', () => {});
});

afterEach(() => {
  globalThis.fetch = realFetch;
  mock.restoreAll();
});

const okJson = (body) => ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) });
const failure = (status) => ({ ok: false, status, json: async () => ({}), text: async () => 'boom' });
const subscriptions = (...items) => okJson({ data: items });
const sub = (status, priceId = 'price_1') => ({ status, items: { data: [{ price: { id: priceId } }] } });

function mockStripe(handler) {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return handler(String(url));
  };
  return calls;
}

test('only active and trialing subscriptions grant premium', () => {
  assert.equal(subscriptionGrantsPremium(sub('active')), true);
  assert.equal(subscriptionGrantsPremium(sub('trialing')), true);
  for (const status of ['canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'paused']) {
    assert.equal(subscriptionGrantsPremium(sub(status)), false, status);
  }
  assert.equal(subscriptionGrantsPremium(null), false);
});

test('STRIPE_PREMIUM_PRICE_IDS restricts which prices count', () => {
  process.env.STRIPE_PREMIUM_PRICE_IDS = 'price_a, price_b';
  assert.equal(subscriptionGrantsPremium(sub('active', 'price_b')), true);
  assert.equal(subscriptionGrantsPremium(sub('active', 'price_other')), false);
});

test('escapeSearchValue escapes quotes and backslashes', () => {
  assert.equal(escapeSearchValue('a"b\\c@x.com'), 'a\\"b\\\\c@x.com');
});

test('non-customer ids are rejected without calling Stripe', async () => {
  const calls = mockStripe(() => subscriptions(sub('active')));
  assert.equal(await isCustomerPremium('cs_test_123'), false);
  assert.equal(await isCustomerPremium(undefined), false);
  assert.equal(calls.length, 0);
});

test('a Stripe answer is cached, so the second check does not call Stripe', async () => {
  const calls = mockStripe(() => subscriptions(sub('active')));
  assert.equal(await isCustomerPremium('cus_1'), true);
  assert.equal(await isCustomerPremium('cus_1'), true);
  assert.equal(calls.length, 1);
});

test('a cancelled subscription has no access', async () => {
  mockStripe(() => subscriptions(sub('canceled')));
  assert.equal(await isCustomerPremium('cus_1'), false);
});

test('a subscription set to cancel at period end keeps access until Stripe flips it', async () => {
  mockStripe(() => subscriptions({ ...sub('active'), cancel_at_period_end: true }));
  assert.equal(await isCustomerPremium('cus_1'), true);
});

test('during a Stripe outage a recently confirmed subscriber keeps access', async () => {
  mockStripe(() => subscriptions(sub('active')));
  assert.equal(await isCustomerPremium('cus_1'), true);

  store.data.delete('askacryptid:premium:cus_1'); // cache expired
  mockStripe(() => failure(500));
  assert.equal(await isCustomerPremium('cus_1'), true);
});

test('during a Stripe outage an unconfirmed customer is denied', async () => {
  mockStripe(() => failure(500));
  assert.equal(await isCustomerPremium('cus_1'), false);
});

test('once Stripe says no, a later outage does not bring access back', async () => {
  mockStripe(() => subscriptions(sub('active')));
  await isCustomerPremium('cus_1');

  store.data.delete('askacryptid:premium:cus_1');
  mockStripe(() => subscriptions(sub('canceled')));
  assert.equal(await isCustomerPremium('cus_1'), false);

  store.data.delete('askacryptid:premium:cus_1');
  mockStripe(() => failure(500));
  assert.equal(await isCustomerPremium('cus_1'), false);
});

test('a login token works once and returns the customer id', async () => {
  const token = await createLoginToken('cus_42');
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(await consumeLoginToken(token), 'cus_42');
  assert.equal(await consumeLoginToken(token), null);
});

test('the raw login token is never stored', async () => {
  const token = await createLoginToken('cus_42');
  for (const key of store.data.keys()) {
    assert.ok(!key.includes(token));
  }
});

test('malformed or unknown tokens are rejected', async () => {
  assert.equal(await consumeLoginToken(undefined), null);
  assert.equal(await consumeLoginToken('short'), null);
  assert.equal(await consumeLoginToken('a'.repeat(43)), null);
});
