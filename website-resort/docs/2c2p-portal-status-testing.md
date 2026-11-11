# 2C2P portal payment status testing

The website recognizes the PGW inquiry codes documented at
https://developer.2c2p.com/docs/response-code-payment:

| Portal outcome | PGW response code | Website behavior |
| --- | --- | --- |
| Approved | `0000` | Confirm the payment and hand the booking to reservations once. |
| Settled | `4110` | Treat as paid; display Settled in the booking desk. |
| Void / Cancel Success | `4047` | Display Voided and flag the reservation for review. |
| Refunded | `4120` | Display Refunded and flag the reservation for review. |

`0003` is a cancelled checkout attempt, not a completed portal void. Failed
voids (`4048`) and rejected/failed refunds (`4121`/`4122`) do not mark an
existing payment as reversed.

## Sandbox acceptance test

Use the sandbox account and transactions approved for testing by 2C2P.
The provider must enable the relevant portal actions for this merchant.

1. Pay for a website test booking. Record its booking reference and invoice
   number from **Admin → Bookings → Payment**. Confirm Approved or Settled.
2. For the void test, void an eligible Approved transaction in the 2C2P
   merchant portal. For the refund test, use a separate Settled transaction
   and perform its refund in the portal. Use the provider's instructions
   for settlement and transaction eligibility.
3. Open the same website booking and press **Check 2C2P status**. This is an
   authenticated inquiry, not a payment mutation. Check the updated status
   and **Payment last checked** time.
4. Confirm the booking appears under **Needs attention**, is absent from
   **Paid** and **Unfinished**, and retains the original transaction reference,
   payment amount, guest details and SiteMinder history.
5. Recheck and repeat the callback if 2C2P supports doing so. A reversed
   payment must not send another confirmation or revert to Paid. Revisit
   the guest confirmation URL in the original browser: it should explain
   the payment reversal and direct the guest to reservations.
6. Review the actual refund amount in the portal and reconcile the stay in
   SiteMinder. A refund may be partial; the inquiry code alone does not prove
   that the entire deposit was returned. The website preserves the original
   payment amount and does not assert a new balance or cancel the stay.
   Archive a reviewed booking when appropriate.

Signed callbacks trigger a fresh inquiry. The nightly cron also checks up
to 100 non-reversed paid/delivered bookings per run, oldest checked first,
including archived bookings. Larger histories take multiple runs to sweep;
the manual check is the immediate way to verify a portal change. Recorded
void/refund outcomes are retained even if a delayed success callback arrives.

## Local verification

Run `npm run test:payments`, `npm run test:unit`, `npm run typecheck`,
`npm run typecheck:api`, and `npm run build`. Payment regression tests intercept
all external HTTP; they do not mutate a live payment, database or email inbox.

No database migration or new environment variable is required. Existing
`status` records the booking hand-off workflow; existing `resp_code` records
the payment state. Reports outside this repository must check `resp_code`
alongside booking status before treating historical paid bookings as funded.

The code cannot complete 2C2P's merchant onboarding or certify portal actions
that the provider has not enabled. Provider sandbox acceptance and production
account provisioning remain separate from local regression verification.
