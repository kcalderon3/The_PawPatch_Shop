# Deployment Guide

## Services

The intended live stack is:

- Vercel for hosting and API routes.
- Supabase for Postgres, Storage, and Auth.
- Stripe for Checkout, Tax, and receipts.
- Optional Resend for admin order notification emails.

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/migrations/001_initial_backend.sql`.
4. Confirm the `pet-photos` bucket exists.
5. Confirm the seeded products exist.
6. Configure Supabase Auth email settings for admin magic links.

## Stripe Setup

1. Use test mode first.
2. Add `STRIPE_SECRET_KEY` to Vercel.
3. Create a webhook endpoint:

```text
https://your-domain.com/api/stripe/webhook
```

4. Subscribe to:

```text
checkout.session.completed
```

5. Add the webhook signing secret as `STRIPE_WEBHOOK_SECRET`.

## Vercel Setup

Add these environment variables in Vercel:

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_UPLOAD_BUCKET=pet-photos
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SITE_URL=
ADMIN_EMAILS=
RESEND_API_KEY=
ORDER_EMAIL_FROM=
```

`SITE_URL` should be the deployed site URL.

## Deploy

Connect the GitHub repository to Vercel and deploy from the `main` branch.

## After Deployment

Test in this order:

1. Home page loads.
2. Shop/product pages load.
3. Product data comes from Supabase.
4. Pet photo upload succeeds.
5. Stripe test checkout opens.
6. Stripe test payment completes.
7. Webhook marks the order as `paid`.
8. Admin can log in and view the order.
9. Admin can update fulfillment status and notes.

