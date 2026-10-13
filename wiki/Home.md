# The Paw Patch Project Wiki

This wiki documents the storefront and backend plan implemented so far for The Paw Patch, a custom pet portrait embroidery shop.

## Quick Links

- [Project Overview](./Project-Overview.md)
- [Architecture](./Architecture.md)
- [Local Development](./Local-Development.md)
- [Ordering Flow](./Ordering-Flow.md)
- [Backend API](./Backend-API.md)
- [Data Model](./Data-Model.md)
- [Admin Dashboard](./Admin-Dashboard.md)
- [Deployment Guide](./Deployment-Guide.md)
- [QA Checklist](./QA-Checklist.md)
- [Roadmap](./Roadmap.md)

## Current Status

The project is a React/Vite storefront with routed shopping pages, product detail/order pages, gallery, FAQs, cart behavior, photo upload handling, checkout hooks, newsletter subscription, and an admin dashboard scaffold.

The backend infrastructure has been added for Vercel API routes, Stripe Checkout, Supabase Postgres, Supabase Storage, Supabase Auth, and optional Resend admin order notifications. The app still has graceful mock/fallback behavior when live environment variables are not configured.

