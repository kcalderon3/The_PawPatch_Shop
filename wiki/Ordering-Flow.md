# Ordering Flow

## Guest Checkout Flow

1. Customer browses the home page, shop page, or product order pages.
2. Customer selects product options: color, size, and quantity.
3. Customer uploads a pet photo for customizable products.
4. Frontend calls `POST /api/uploads/sign` with file metadata.
5. Backend creates a storage path and returns signed upload information.
6. Browser uploads the photo directly to Supabase Storage.
7. Frontend stores upload metadata on the cart line item.
8. Customer opens checkout.
9. Frontend calls `POST /api/checkout/session` with cart lines.
10. Backend validates every item against trusted product data.
11. Backend creates a pending Supabase order.
12. Backend creates a Stripe Checkout Session.
13. Customer completes payment in Stripe Checkout.
14. Stripe sends `checkout.session.completed` to `/api/stripe/webhook`.
15. Webhook updates the Supabase order to `paid` and stores customer/shipping/payment details.
16. Admin reviews the order in `/admin`.

## Customizable Products

Customizable products require at least one uploaded pet photo before they can be added to cart and checked out.

Current customizable products are:

- `embroidered-hoodie`
- `embroidered-crewneck`
- `embroidered-sweatsuit`
- `pet-name-add-on`
- `pet-face-add-on`

The gift card is non-customizable and can check out without an upload.

## Shipping

Stripe Checkout collects a US shipping address and offers free shipping. The webhook flags addresses outside the continental US policy, including AK, HI, and US territories, by adding an admin note.

## Receipts And Notifications

Stripe handles customer receipts. Optional admin order notification email is supported through Resend when `RESEND_API_KEY` is configured.

