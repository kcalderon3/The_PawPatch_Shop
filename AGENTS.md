# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

This is a routed e-commerce mock storefront for The Paw Patch, a custom pet portrait embroidery shop. It is built with Vite, React, React Router, and plain CSS. The current checkout is intentionally mocked: products, variants, pet-photo upload metadata, cart state, and checkout confirmation are handled client-side only.

## Tech Stack

- React 19
- React Router
- Vite 7
- pnpm
- Plain CSS in `src/styles.css`
- Static assets served from `public/assets`

## Common Commands

Install dependencies:

```sh
pnpm install
```

Run the local dev server:

```sh
pnpm run dev
```

Build for production:

```sh
pnpm run build
```

Preview the production build:

```sh
pnpm run preview
```

The dev and preview scripts bind to `127.0.0.1`.

## Repository Structure

- `src/App.jsx` contains route definitions, shared layout, product catalog, product order pages, gallery page data, FAQ page data, and storefront interactions.
- `src/main.jsx` mounts the React app inside `BrowserRouter`.
- `src/styles.css` contains the full visual system and responsive layout.
- `public/assets/` contains local placeholder product and gallery images.
- `index.html` is the Vite entry document.

## Implementation Guidelines

- Keep the site as a polished mock-commerce experience unless explicitly asked to add a real checkout provider.
- Use React Router for landing pages. Keep global cart/header/footer state in shared layout code so page-level routes can evolve without losing cart behavior.
- Preserve the visual direction inspired by the reference site: olive/brown backgrounds, pale cream sections, mustard accents, large serif headings, and compact navigation.
- Keep product data structured with `id`, `name`, `price`, `category`, `images`, `description`, `colors`, `sizes`, and `customizable`.
- For customizable products, keep pet-photo upload validation before adding to cart.
- Use React state for UI behavior unless a real persistence/backend requirement is added.
- Avoid adding heavy UI libraries for small changes; existing plain CSS is intentional.
- Maintain responsive behavior for desktop and mobile. Watch for horizontal overflow, especially in product detail, cart, and form controls.
- Keep assets referenced with root-relative paths such as `/assets/hoodie-pink.png`.
- Do not commit generated output or dependencies: `node_modules/`, `dist/`, and `.pnpm-store/` are ignored.

## Testing and QA

Before finishing meaningful changes, run:

```sh
pnpm run build
```

For UI changes, also manually verify:

- Product card selection opens the matching `/products/:productId` order page.
- Customizable products require a pet photo before adding to cart.
- Gift card or non-customizable products can be added without an upload.
- Cart quantity changes and subtotal update correctly.
- Mock checkout shows a confirmation message.
- Gallery modal opens, navigates, and closes.
- FAQ accordion opens and closes.
- Subscribe form accepts an email and shows success feedback.
- Mobile layout has no document-level horizontal scrolling.

There is no automated test suite configured yet.
