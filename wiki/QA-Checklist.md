# QA Checklist

## Build

```sh
pnpm run build
```

## Storefront

- Home page loads without horizontal overflow.
- Hero image and text scale correctly on desktop and mobile.
- Featured product cards link to the correct product pages.
- Shop page lists all active products.
- Gallery modal opens, navigates, and closes.
- FAQ accordion opens and closes.
- Subscribe form accepts an email and shows success feedback.

## Product Ordering

- Product page opens from `/products/:productId`.
- Color selection works.
- Size selection works.
- Quantity selection works.
- Customizable products require a pet photo before add to cart.
- Gift card can be added without a pet photo.
- Cart opens after adding an item.
- Cart quantity changes update subtotal.
- Removing an item works.

## Live Checkout

- Signed upload request succeeds for valid image files.
- Invalid file types are rejected.
- Oversized files are rejected.
- Supabase Storage receives uploaded pet photos.
- Checkout API rejects invalid product IDs.
- Checkout API rejects invalid colors.
- Checkout API rejects invalid sizes.
- Checkout API rejects missing uploads for customizable products.
- Stripe Checkout opens in test mode.
- Stripe collects email, payment, tax, and shipping.
- Successful payment returns to `/checkout/success`.
- Cancelled checkout returns to `/checkout/cancel`.

## Webhook

- `checkout.session.completed` marks order as `paid`.
- Webhook stores Stripe session/payment IDs.
- Webhook stores customer and shipping details.
- Duplicate webhook events do not create duplicate orders.
- AK, HI, and territory addresses are flagged in admin notes.

## Admin

- Approved admin can log in.
- Approved admin can view orders.
- Approved admin can update fulfillment status.
- Approved admin can update admin notes.
- Non-admin users cannot view admin order data.

## Deployment

- Vercel environment variables are set.
- Supabase migration has been applied.
- Stripe webhook endpoint is configured.
- Production routes refresh correctly.
- `/api/*` routes are not swallowed by React Router.

