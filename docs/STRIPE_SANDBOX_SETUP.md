# Stripe sandbox checkout setup

The checkout code uses Stripe-hosted Checkout and Supabase Edge Functions. The
browser never receives the Stripe secret key, and it cannot choose the amount
that Stripe charges. The server reloads the signed-in customer's cart, applies
the current PAPR pricing rules, and saves an order snapshot before redirecting
to Stripe.

## 1. Create the order tables

Open the Supabase SQL editor for the PAPR project and run:

`supabase/migrations/202609120001_stripe_checkout.sql`

This creates `orders` and `order_items`, enables row-level security, and adds an
`order_id` link to `customer_files`. Customers can read only their own orders;
only the server functions can create or update payment records.

## 2. Add sandbox secrets to Supabase

From the Stripe Dashboard, switch to the PAPR sandbox and copy its secret key.
Never paste that key into a `VITE_` variable, the browser, Git, or chat.

Set the Edge Function secrets from a local terminal:

```sh
supabase secrets set \
  STRIPE_SECRET_KEY=sk_test_REPLACE_ME \
  SITE_URL=http://localhost:5173 \
  CHECKOUT_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Use the deployed website origin for `SITE_URL` and
`CHECKOUT_ALLOWED_ORIGINS` when testing the hosted site.

## 3. Deploy the functions

Link the local folder to the existing Supabase project, then deploy:

```sh
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy create-checkout-session
supabase functions deploy verify-checkout-session
supabase functions deploy stripe-webhook
```

`supabase/config.toml` keeps authentication required for the two browser
functions and disables the Supabase JWT check only for the Stripe webhook. The
webhook still rejects every request that does not carry a valid Stripe
signature.

## 4. Register the Stripe webhook

In the Stripe sandbox, add this endpoint:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

Subscribe it to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

Copy the endpoint's signing secret and save it in Supabase:

```sh
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_REPLACE_ME
```

The signed webhook—not the success-page URL—is what marks an order paid,
attaches uploaded artwork to it, and clears the matching cart rows.

## 5. Enable the checkout button

Copy `.env.example` to `.env.local` if needed and keep the existing Supabase
values. Change only:

```text
VITE_STRIPE_SANDBOX_ENABLED=true
```

Restart the local development server after changing the environment file.

## 6. Test safely

Sign in as a customer, add a product and saved address, then continue from the
cart. On Stripe's sandbox page, use a Stripe test card such as `4242 4242 4242
4242`, any future expiry date, and any three-digit CVC. Confirm all of these:

- A successful payment returns to `/checkout/success` and becomes confirmed
  after the webhook arrives.
- The paid order appears in `orders` with matching rows in `order_items`.
- Only the purchased customer's cart rows are cleared.
- Uploaded artwork is marked `submitted` and linked to the new order.
- Cancelling Stripe returns to checkout without charging or clearing the cart.
- A second test customer cannot select the first customer's orders or artwork.

## Moving to live payments later

The functions deliberately reject non-test Stripe keys and non-test Checkout
Session IDs. Going live should be a separate, reviewed change: remove those
sandbox guards, configure live-mode Stripe keys and a live webhook endpoint,
replace the development site URL, and rerun the payment/privacy checks. Stripe
sandbox objects and live-mode objects are separate.
