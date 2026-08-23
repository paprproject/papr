# PAPR Project Requirements Document

## 1. Product Summary

PAPR is a web-based print ordering platform for customers in Singapore who need advertising materials, branded merchandise, custom packaging, and recurring B2B print fulfillment. The current product combines a storefront, instant quote calculator, configurable product detail flow, online design editor, private customer account, saved delivery information, artwork storage, and B2B enquiry path.

The core product promise is: customers can choose a print product, price it quickly, provide artwork through upload or the browser editor, save it to a private cart, and move toward checkout with clear delivery and production expectations.

## 2. Current Scope

### In Scope

- Public marketing and discovery pages for home, products, pricing, B2B, and contact.
- Supabase-backed product catalogue.
- Product cards and product detail pages with configurable size, material/stock, finish, print sides, turnaround, and quantity.
- Instant quote calculator with live price updates, volume discounts, copyable quote summary, and deep link into product configuration.
- Supabase authentication for sign up, sign in, sign out, and session persistence.
- Private cart per authenticated customer.
- Artwork upload during add-to-cart, including Supabase Storage persistence and customer file metadata.
- Customer account area with profile, favorite products, saved Singapore delivery addresses, orders tab surface, and artwork downloads.
- Browser-based editor using Fabric.js with canvas tools, templates, layers, properties, zoom, undo, redo, reset, and panel visibility controls.
- Contact and B2B enquiry paths via mailto and WhatsApp links.

### Out Of Scope For Current MVP

- Native payment processing.
- Completed checkout and order creation.
- Admin dashboard for managing products, orders, artwork, pricing, or customer accounts.
- Production workflow management after checkout.
- Shipment tracking integrations.
- Real B2B API or bulk upload implementation.
- Saved editor design persistence across sessions.
- Automated prepress checks for bleed, resolution, color space, or file integrity.

## 3. Goals

- Let customers understand PAPR's offering and trust the production/delivery promise.
- Let customers browse available print products loaded from Supabase.
- Let customers generate a fast, transparent SGD quote without contacting sales.
- Let customers configure a product and provide artwork before adding it to cart.
- Keep customer carts, files, favorites, profile, and addresses private to the signed-in user.
- Provide a self-service design path for simple artwork creation or editing.
- Capture B2B demand through clear enterprise positioning and direct contact paths.

## 4. Primary Users

- Small business owners ordering business cards, flyers, stickers, posters, menus, and branded collateral.
- Marketers and brand teams running campaigns that need repeated print orders.
- Agencies reselling print services to clients.
- F&B chains and retail operators managing print needs across locations.
- Events teams ordering high-volume promotional materials.
- Internal PAPR operators who will eventually need order, artwork, customer, and production visibility.

## 5. Core User Journeys

### Browse And Discover

1. Customer lands on the home page.
2. Customer sees PAPR positioning, delivery promise, product categories, trust indicators, and process summary.
3. Customer navigates to products, pricing, quote, B2B, contact, editor, cart, login, or account.

### Instant Quote To Product

1. Customer opens `/quote`.
2. System loads products from Supabase.
3. Customer selects a product, quantity, material, finish, and turnaround.
4. System updates total price, unit price, add-ons, discount, and comparison quantities.
5. Customer copies quote summary or starts an order.
6. System routes to `/products/:id` with selected quote parameters in the URL.
7. Product detail page preselects matching stock, finish, turnaround, and quantity.

### Product Configuration To Cart

1. Customer opens a product detail page.
2. System loads the selected product from Supabase.
3. Customer selects size, stock/material, finish, sides, turnaround, and quantity.
4. Customer chooses either online editor or artwork upload.
5. System requires a design method before add-to-cart.
6. If uploading, system validates accepted file types and maximum size.
7. System creates a cart item in Supabase, stores product snapshot and pricing, uploads artwork to storage, and inserts file metadata.
8. Cart count and customer artwork list update for the signed-in customer.

### Account Management

1. Customer signs in or signs up through Supabase Auth.
2. System loads or creates a customer profile.
3. Customer can update profile details.
4. Customer can add, edit, remove, and set default Singapore delivery addresses.
5. Customer can favorite products.
6. Customer can view uploaded artwork and generate short-lived signed download URLs.
7. Customer can view account sections for orders, addresses, artwork, favorites, and profile.

### Design Editor

1. Customer opens `/editor/new` or `/editor/:designId`.
2. System shows a full-screen editor workspace.
3. Customer can add and manipulate design objects on a canvas.
4. Customer can apply templates, edit canvas background, update selected object properties, inspect layers, lock/hide layers, zoom, undo, redo, and reset.
5. Future requirement: customer must be able to save/export/attach editor output to a cart item.

### B2B Enquiry

1. Business customer opens `/b2b` or pricing enterprise CTA.
2. Customer sees enterprise benefits, target sectors, and custom pricing prompt.
3. Customer contacts PAPR through email link.
4. Future requirement: enquiry should be captured server-side for sales follow-up.

## 6. Functional Requirements

### Navigation And Layout

- The app must use React Router routes currently defined for `/`, `/products`, `/quote`, `/pricing`, `/b2b`, `/contact`, `/cart`, `/checkout`, `/account`, `/login`, `/products/:id`, `/editor/new`, and `/editor/:designId`.
- Legacy or alternate routes must redirect as currently defined: `/shop` to `/quote`, `/faq` to `/contact`, `/why` to `/`, and `/orders` to `/account?tab=orders`.
- The global layout must include navigation, footer, route scroll management, profile access, and floating chat/contact affordance where applicable.

### Product Catalogue

- Products must be loaded from the Supabase `products` table.
- Product records must support id, name, description, category, starting price, delivery days, created date, image URL, rating, review count, order count, and badge.
- Product list and detail pages must show loading and error states.
- Product detail pages must handle missing or invalid product IDs gracefully.

### Pricing And Quote Logic

- Prices must display in SGD.
- Quote calculator must support product selection, quantity scaling, material adjustment, finish adjustment, turnaround adjustment, and volume discount.
- Product detail pricing must include product starting price, selected option adjustments, quantity multiplier, volume discount, total, and per-unit price.
- Quantity must respect each product configuration's minimum quantity and step size.
- Copied quote summaries must include product, quantity, selected options, total, unit price, discount when applicable, delivery promise, and quote validity copy.

### Product Configuration

- Business card-like products must support standard, square, mini, and US Letter sizes; multiple stocks; matte/gloss/spot UV/foil/rounded finish options; single/double-sided printing; express/standard/economy turnaround.
- Flyer-like products must support A5, A4, DL, and square sizes; multiple stocks; matte/gloss/spot UV finishes; single/double-sided printing; express/standard/economy turnaround.
- Future requirement: configurations should move from hardcoded client rules to data-backed product configuration records.

### Authentication

- Customers must be able to sign up and sign in with email and password.
- Auth state must persist through Supabase sessions.
- Sign out must clear local account and cart state.
- Private customer features must require an authenticated user.
- Auth errors must be displayed in actionable user-facing language.

### Cart

- Cart items must be scoped to the authenticated user.
- Cart items must persist in Supabase `cart_items`.
- Cart items must store a product snapshot to preserve order context if catalogue data changes later.
- Cart must support add, remove, clear, refresh, loading, error, and count states.
- Cart must detach linked customer files when items are removed or cart is cleared.
- Future requirement: cart should proceed into a completed checkout and order submission flow.

### Artwork Uploads

- Artwork uploads must support PDF, PNG, JPG/JPEG, and TIFF.
- Artwork file size must be limited to 50 MB.
- Filenames must be normalized to safe storage paths.
- Uploaded files must be stored in the `customer-artwork` Supabase Storage bucket.
- Metadata must be stored in `customer_files` with user, cart item, bucket, storage path, original filename, MIME type, size, and status.
- If metadata insertion fails after upload, the uploaded storage object and cart item must be rolled back.
- Customers must be able to generate signed download URLs for their own artwork files.

### Customer Account

- Customer profiles must load from or be created in `customer_profiles`.
- Profile must include full name, company, and WhatsApp.
- Saved addresses must support label, recipient, company, phone, address lines, Singapore postal code, country code, and default status.
- Postal codes must be validated as 6-digit Singapore postal codes.
- The app must enforce the maximum saved-address limit defined by account configuration.
- Favorite products must be stored in `favorite_products`.
- Account loading failures must fall back to a usable profile where possible and show an error.

### Checkout And Orders

- Current checkout page is a placeholder.
- MVP checkout must collect or confirm delivery address, contact details, production notes, artwork status, cart totals, tax/shipping assumptions, and payment method.
- Checkout must create durable order records and order item records.
- Submitted artwork statuses should move from `attached_to_cart` to `submitted`.
- Cart should clear only after successful order creation/payment handoff.
- Orders account tab should show submitted order history and statuses once backend order records exist.

### Design Editor

- Editor must support selection, canvas settings, object properties, typography properties, layers, visibility, lock state, templates, undo/redo history, zoom, reset, and responsive panels.
- Editor canvas must serialize document state with custom object metadata.
- History must cap at the configured limit to prevent runaway memory use.
- Future requirement: editor documents must be saved to backend storage or database.
- Future requirement: editor output must be exportable as print-ready artwork or attachable to cart.

### Contact And B2B

- Contact form must open a prefilled email draft to the configured PAPR contact email.
- WhatsApp link must open a prefilled message.
- FAQ content must be available on the contact page.
- B2B page must highlight account management, NET30 terms, bulk upload API positioning, white-label options, sectors served, and custom quote CTA.
- Future requirement: contact and B2B enquiries should be persisted in a backend table or CRM.

## 7. Non-Functional Requirements

- The application must be responsive across mobile, tablet, and desktop.
- Customer data must be isolated by authenticated Supabase user ID.
- Storage and database access must rely on Supabase row-level security policies.
- Errors from product, auth, account, cart, and storage operations must not expose sensitive internals.
- UI should prioritize fast scanning, clear pricing, and low-friction ordering.
- Client-side state should avoid leaking previous-user private data during auth transitions.
- Build must pass TypeScript and Vite production build.
- Linting should pass with the configured ESLint setup.
- Environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required.

## 8. Data Requirements

### Supabase Tables Currently Implied

- `products`
- `cart_items`
- `customer_files`
- `customer_profiles`
- `favorite_products`
- `saved_addresses`

### Supabase Storage Buckets Currently Implied

- `customer-artwork`

### Future Tables Needed

- `orders`
- `order_items`
- `payments` or payment handoff records
- `editor_designs`
- `enquiries`
- `product_configurations`
- `discount_rules`

## 9. Success Metrics

- Product catalogue load success rate.
- Quote-to-product-detail click-through rate.
- Product-detail-to-cart conversion rate.
- Artwork upload success rate.
- Cart-to-checkout start rate.
- Checkout completion rate once checkout is implemented.
- Account sign-up/sign-in completion rate.
- B2B enquiry submissions.
- Repeat order rate and saved-address usage.

## 10. MVP Completion Checklist

- Replace starter README with project-specific setup and product documentation.
- Complete checkout page and order creation.
- Add order history rendering in account.
- Persist and retrieve editor designs.
- Connect editor output to product/cart workflow.
- Add admin or operator workflow for products, orders, and artwork review.
- Add Supabase schema documentation and RLS policy requirements.
- Add tests for pricing, quote deep links, cart upload rollback, saved address validation, and auth-state privacy.
- Verify production build and lint before release.

## 11. Open Questions

- Which payment provider should be used for Singapore checkout: PayNow manual proof, Stripe, HitPay, bank transfer, or mixed methods?
- Should GST be included in displayed prices or added at checkout?
- What is the authoritative source for product configurations and print option pricing?
- Which products are included in MVP beyond business cards and flyers?
- Should B2B customers have account-level discount rules and payment terms in-app?
- What statuses should orders move through from submission to delivery?
- Should uploaded artwork receive automated preflight checks before payment?
- Should editor-generated artwork be treated the same as uploaded files in storage and account history?
- Is the primary market Singapore-only for launch, despite production being in Indonesia?
