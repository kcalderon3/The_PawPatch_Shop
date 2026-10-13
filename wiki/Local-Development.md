# Local Development

## Requirements

- Node.js compatible with the current Vite setup.
- pnpm.
- Optional: Supabase project, Stripe test account, and Vercel CLI for live backend testing.

## Install

```sh
pnpm install
```

## Run The Frontend

```sh
pnpm run dev
```

The dev server binds to `127.0.0.1`.

## Build

```sh
pnpm run build
```

## Preview Production Build

```sh
pnpm run preview
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill values as services are configured.

Required for browser Supabase Auth and direct signed uploads:

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Required for live backend checkout/storage/admin:

```sh
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_UPLOAD_BUCKET=pet-photos
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SITE_URL=
ADMIN_EMAILS=
```

Optional for admin order notifications:

```sh
RESEND_API_KEY=
ORDER_EMAIL_FROM=
```

## Local API Behavior

Plain `pnpm run dev` runs Vite. It does not run Vercel serverless functions by itself, so the frontend includes mock/fallback behavior when API routes or environment variables are unavailable.

Use Vercel development tooling or a Vercel preview deployment when testing the real API route flow end to end.

