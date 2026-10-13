# Backend API

## `GET /api/products`

Returns active storefront products.

Response shape:

```json
{
  "products": [
    {
      "id": "embroidered-hoodie",
      "name": "Embroidered Hoodie",
      "price": 110,
      "category": "Hoodies",
      "images": ["/assets/embroidered-hoodie.jpeg"],
      "description": "...",
      "colors": ["Blush"],
      "sizes": ["XS"],
      "customizable": true
    }
  ]
}
```

If Supabase is not configured, the route can fall back to local product data.

## `POST /api/uploads/sign`

Creates signed upload information for a pet photo.

Request:

```json
{
  "fileName": "dog.jpg",
  "fileSize": 123456,
  "fileType": "image/jpeg"
}
```

Important validation:

- File must be an image.
- File must be within the configured size limit.
- Backend generates the storage path.

## `POST /api/checkout/session`

Validates cart lines, creates a pending order, and returns a Stripe Checkout URL.

Important validation:

- Product ID must exist.
- Color and size must be allowed for the product.
- Quantity must be valid.
- Customizable products must include upload metadata.
- Client-side prices are ignored.

## `POST /api/stripe/webhook`

Handles Stripe events.

Currently handled:

- `checkout.session.completed`

Effects:

- Marks order as `paid`.
- Stores Stripe session/payment IDs.
- Stores customer email, customer name, shipping address, subtotal, tax, total, and paid timestamp.
- Adds an admin note for addresses outside the continental US policy.
- Optionally sends an admin notification email.

## `GET /api/admin/orders`

Returns orders for approved admins only.

Requires:

```http
Authorization: Bearer <supabase-access-token>
```

The backend verifies the Supabase user and checks the email against `ADMIN_EMAILS`.

## `PATCH /api/admin/orders`

Updates admin-managed fields for an order.

Typical changes:

```json
{
  "orderId": "uuid",
  "changes": {
    "fulfillment_status": "in_production",
    "admin_notes": "Design approved by customer."
  }
}
```

## `POST /api/subscribe`

Stores newsletter subscribers.

Request:

```json
{
  "email": "customer@example.com"
}
```

