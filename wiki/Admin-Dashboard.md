# Admin Dashboard

## Route

The admin dashboard is available at:

```text
/admin
```

## Authentication

The admin page uses Supabase Auth. Admins enter an email address and receive a magic link.

Required frontend variables:

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Required backend variables:

```sh
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=
```

`ADMIN_EMAILS` is a comma-separated list of approved admin email addresses.

## Access Control

The admin API checks:

1. The request has a valid Supabase access token.
2. The authenticated email is included in `ADMIN_EMAILS`.

Non-admin users should not be able to retrieve or update order data.

## Admin Capabilities

Current dashboard capabilities:

- View orders.
- Review customer email and shipping details.
- Review order items, color, size, quantity, and upload metadata.
- Update fulfillment status.
- Save admin notes.

## Suggested Fulfillment Statuses

- `needs_review`
- `design_sent`
- `approved`
- `in_production`
- `shipped`
- `cancelled`
- `refunded`

## Future Admin Enhancements

- Generate signed preview links for uploaded pet photos.
- Upload design proofs.
- Send proof approval emails.
- Store tracking numbers.
- Filter orders by status.
- Search by customer email or order ID.

