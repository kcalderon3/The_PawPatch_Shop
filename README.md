# The_PawPatch_Shop
Website for custom embroidered sweaters 

## Wiki

Project documentation lives in [`wiki/Home.md`](./wiki/Home.md).

## Local development

```sh
pnpm install
pnpm run dev
```

The Vite dev server binds to `127.0.0.1`.

## Backend setup

The live ordering flow is designed for Vercel serverless functions, Stripe Checkout, and Supabase.

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_backend.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill in Supabase, Stripe, admin email, and optional Resend values.
4. Add the same environment variables to Vercel.
5. In Stripe, create a webhook endpoint pointing to `/api/stripe/webhook` and subscribe to `checkout.session.completed`.

Without Stripe/Supabase environment variables, the storefront still builds and uses local mock/fallback behavior.
