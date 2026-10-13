# Architecture

## Frontend

The storefront is a Vite + React app using React Router.

Key files:

- `src/main.jsx`: mounts the app inside `BrowserRouter`.
- `src/App.jsx`: route definitions, shared layout, storefront interactions, cart state, product pages, checkout states, gallery, FAQ, and admin dashboard.
- `src/data/storefront.js`: fallback product, gallery, and FAQ data.
- `src/lib/api.js`: browser API helpers for products, uploads, checkout, subscribe, and admin operations.
- `src/styles.css`: visual system and responsive layout.
- `public/assets/`: storefront images and product assets.

## Backend

The backend uses Vercel serverless functions in the `api/` directory.

Key folders:

- `api/_lib/`: shared HTTP, Supabase, and product validation helpers.
- `api/products.js`: public product catalog API.
- `api/uploads/sign.js`: signed upload request API.
- `api/checkout/session.js`: Stripe Checkout Session creation API.
- `api/stripe/webhook.js`: Stripe webhook handler.
- `api/admin/orders.js`: admin-only order listing and status updates.
- `api/subscribe.js`: newsletter subscription API.

## Database And Storage

Supabase provides:

- Postgres tables for products, options, orders, order items, uploads, and subscribers.
- A private `pet-photos` storage bucket.
- Row Level Security for public product reads and protected order/admin data.
- Auth sessions used by the admin dashboard.

The initial schema and seed data live in:

- `supabase/migrations/001_initial_backend.sql`

## Deployment

`vercel.json` routes `/api/*` to Vercel functions and all other paths to `index.html`, allowing React Router pages to work on refresh.

