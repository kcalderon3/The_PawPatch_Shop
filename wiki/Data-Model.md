# Data Model

The initial Supabase schema is defined in `supabase/migrations/001_initial_backend.sql`.

## `products`

Stores storefront product data.

Important columns:

- `id`
- `name`
- `base_price`
- `category`
- `images`
- `description`
- `customizable`
- `active`
- `sort_order`

## `product_options`

Stores allowed colors and sizes per product.

Important columns:

- `product_id`
- `colors`
- `sizes`

## `orders`

Stores checkout/order-level data.

Important columns:

- `id`
- `status`
- `fulfillment_status`
- `stripe_session_id`
- `stripe_payment_intent_id`
- `customer_email`
- `customer_name`
- shipping address fields
- `subtotal_cents`
- `tax_cents`
- `total_cents`
- `admin_notes`
- `paid_at`

## `order_items`

Stores product snapshots for each order.

Important columns:

- `order_id`
- `product_id`
- `product_name`
- `product_price_cents`
- `color`
- `size`
- `quantity`

## `order_item_uploads`

Stores uploaded pet photo references.

Important columns:

- `order_item_id`
- `storage_bucket`
- `storage_path`
- `original_filename`
- `mime_type`
- `file_size`

## `subscribers`

Stores newsletter signups.

Important columns:

- `email`
- `source`
- `created_at`

## Storage Bucket

The migration creates a private Supabase Storage bucket:

- `pet-photos`

Uploaded pet photos are intended to be private and accessed through admin-controlled flows.

