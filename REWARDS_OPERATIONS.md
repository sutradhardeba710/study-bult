# Study Volte Coin Rewards — Operations Guide

## What is live

- XP remains the non-cash engagement score used for streaks, badges, and the leaderboard.
- Coins are a separate redeemable balance.
- `100 coins = ₹1`.
- One approved, eligible paper earns `100 coins`.
- Guest uploads never earn coins.
- A paper approval is idempotent: approving the same paper again cannot credit it twice.
- Daily earning cap: `1,000 coins` per student.
- Calendar-year earning cap: `200,000 coins` per student.
- Default program budget: `500,000 coins` per month. Create `coinBudget/YYYY-MM`
  to set a different `capCoins` or close that month.

## Redemption policy

Supported amounts:

| Coins | Value | Amazon | Flipkart |
|---:|---:|:---:|:---:|
| 1,000 | ₹10 | Yes | No |
| 2,500 | ₹25 | Yes | No |
| 5,000 | ₹50 | Yes | No |
| 10,000 | ₹100 | Yes | Yes |

To request a gift card, a student must:

- have a verified email;
- have a verified phone;
- have an account at least 7 days old;
- have at least 10 approved papers;
- have enough available coins;
- have no other open request;
- have made fewer than two requests in the current month; and
- accept the lawful-upload ownership confirmation.

Students can cancel a new request for 30 minutes. Coins are held immediately and
are returned atomically if the request is cancelled or rejected.

## Manual fulfilment workflow

1. Open **Admin → Gift-card Withdrawals**.
2. Work from the breached and due-soon queues first.
3. Review the account age, approved-paper count, risk flags, brand, and value.
4. Approve the request after the fraud check.
5. Buy the exact India-region voucher from an authorised source.
6. Paste the code and optional PIN/expiry into the selected request.
7. Independently verify that the code is unused and matches the brand and amount.
8. Check the verification confirmation, then click **Fulfil and notify student**.

The code is encrypted with AES-256-GCM before storage. Only a fulfilled request's
owner or an administrator can reveal it through the audited server function.

## SLA behaviour

- Delivery promise: 24 hours from the request time.
- The scheduled watcher runs every 30 minutes.
- Admin warning stages are logged at approximately 12 hours and 4 hours remaining.
- A breached request receives one automatic `100 coin` apology credit.
- The breach credit is ledgered and idempotent.

## Required production configuration

Set these as Cloud Functions runtime secrets or environment variables:

```text
VOUCHER_ENCRYPTION_KEY=<long random secret, minimum 24 characters>
REWARD_HASH_SALT=<long random secret>
REWARDS_ADMIN_EMAIL=<operations inbox>
EMAIL_HOST=<smtp host>
EMAIL_PORT=587
EMAIL_USER=<smtp username>
EMAIL_PASS=<smtp password>
```

Do not put real values in Git, frontend environment variables, or Firebase Hosting.
Keep the previous voucher encryption key available during a planned key rotation;
old issued vouchers cannot be decrypted if the key is discarded.

## Firebase deployment

From the repository root:

```bash
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only functions
firebase deploy --only hosting
```

Deploy the rules and indexes before exposing the Earnings page. Composite indexes
may take several minutes to finish building.

## Emergency controls

To pause new withdrawals without hiding balances, create or update:

```text
coinProgram/config
  paused: true
  pauseMessage: "Withdrawals are temporarily paused while we complete maintenance."
```

Resume by setting `paused` to `false`. Never repair a balance by editing a wallet
from the browser. Use a reviewed server-side adjustment that writes both the wallet
and an append-only `coinLedger` entry in one transaction.

## Data model

- `wallets/{uid}` — cached available/on-hold/lifetime totals.
- `coinLedger/{entryId}` — append-only source of truth for every balance movement.
- `coinIdempotency/{key}` — prevents duplicate awards, refunds, settlement, and SLA bonuses.
- `coinBudget/{YYYY-MM}` — monthly program cap and spend.
- `withdrawals/{id}` — request state and 24-hour SLA timestamps.
- `voucherStock/{id}` — encrypted issued voucher material; never client-readable.
- `voucherAccessLog/{id}` — reveal audit records.
- `voucherIssues/{id}` — one student issue report per fulfilled withdrawal.

All money-related writes are denied to browser clients by Firestore rules and are
performed with the Firebase Admin SDK in Cloud Functions.
