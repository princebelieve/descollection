# Des Collection LTD client

The customer storefront is a React and Vite app. Routes live in `src/pages`, shared interface components in `src/components`, store state in `src/context`, product data in `src/data`, and small shared helpers in `src/utils`.

## Run

Run `npm install` once at the repository root to install both workspaces. Then run `npm run dev` for the storefront and `npm run server:dev` in a second terminal for the API. The API reads its configuration from `server/.env`.

Run `npm run build` at the repository root to create `client/dist`. The Express server serves that client build in production.

## Catalogue

Product images live once in `public/assets`, with readable filenames. Prices visible in the supplied WhatsApp messages are included in the starter catalogue. Products without a clearly visible price remain unpriced. In Admin, **Add starter photo catalogue** adds missing starter products and applies the supplied prices to matching existing products.
