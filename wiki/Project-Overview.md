# Project Overview

## Purpose

The Paw Patch storefront sells custom embroidered sweaters and related products featuring customers' pets. Customers can browse products, select variants, upload pet photos, and proceed through checkout.

## Product Experience

The current frontend includes:

- Home page with hero, featured product cards, and an about section.
- Shop landing page with the product catalog.
- Product order pages at `/products/:productId`.
- Gallery landing page.
- FAQ landing page.
- Cart drawer with quantity editing and subtotal.
- Newsletter footer with social links.
- Checkout success and cancel pages.
- Admin dashboard route at `/admin`.

## Backend Direction

The live backend is designed around:

- Vercel for hosting and serverless API routes.
- Supabase Postgres for products, orders, order items, uploads, and subscribers.
- Supabase Storage for private pet photo uploads.
- Supabase Auth for admin login.
- Stripe Checkout for payment, tax, shipping collection, and receipts.
- Optional Resend email for admin order notifications.

## Important Constraint

Client-side prices and cart data are never trusted in the live checkout path. The backend validates product IDs, prices, allowed colors, allowed sizes, required uploads, and quantities before creating a Stripe Checkout Session.

