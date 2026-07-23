# Activities Completed So Far

## Storefront & Shop Fixes
- Fixed `/dashboard/shop` "Create Your Shop" button non-functionality by moving `CreateShopModal` into the empty-state block in `app/(dashboard)/dashboard/shop/page.tsx`
- Fixed backend `E_ROUTE_NOT_FOUND: Cannot POST:/user/shop` error by updating Next.js rewrite in `next.config.ts` to include `/api/` prefix
- Updated all `app/api/` proxy routes to include `/api/` prefix when calling backend endpoints
- Fixed double `/api/api/` path issue in `app/shop/[subdomain]/page.tsx` by switching to `/storefront/:subdomain` backend endpoints
- Removed redundant product fetch in `app/shop/[subdomain]/page.tsx` since storefront controller embeds products in its response
- Fixed double `/api/` path bugs in `src/components/settings/ApiKeysSection.tsx`, `src/components/settings/WebhooksSection.tsx`, and `components/WaitingForPaymentModal.tsx` SSE URL
- Created `app/api/user/prices/route.ts` proxy and `lib/usePrices.ts` hook for 60-second live price polling
- Fixed "Add to Cart" button not showing in shopfront by removing `product.is_active` gating in `app/shop/[subdomain]/page.tsx`
- Fixed storefront cart "View Cart" button to redirect unauthenticated customers to `/login` instead of navigating to dashboard-only `/cart` route

## Guest Checkout
- Made storefront cart fully usable without auth: `addToCart`, `updateCartItem`, `removeCartItem` now use localStorage guest cart when no token is present
- Wired storefront "View Cart" button to public `/checkout` page instead of `/dashboard/cart`
- Created guest checkout page at `app/checkout/page.tsx` with cart review, guest details form, and crypto checkout flow
- Guest checkout calls public backend endpoints without auth: `/backend/cart/checkout` and `/backend/cart/wallet`
- Created Next.js proxy routes `app/api/cart/checkout/route.ts` and `app/api/cart/wallet/route.ts` forwarding to backend public guest endpoints
- Guest checkout sends `customer_email`, `items` with `product_id`, `quantity`, `price`, `shopId`, and wallet request uses `reference_id` per new backend contract
- Added success redirect and cart cleanup on payment completion
- Storefront guest cart now stores `shop_id` on each item so checkout includes `shopId` in the items payload
- Fixed `/checkout` page to load cart from server API when user is logged in, falling back to localStorage guest cart when not; previously it only read localStorage which was empty for authenticated users
- Added delivery settings fetch on `/checkout` via `/backend/shop/[subdomain]/delivery-settings` to calculate delivery fee, promo code, and discount totals
- Added delivery address form fields, state selector, promo code input, and order summary with `items_total`, `delivery_fee`, `discount_amount`, and backend `fiat_amount` on `/checkout`
- Updated checkout payload to match backend contract: `customer_email`, `items` with `product_id`, `quantity`, `price`, `shopId`, `delivery_address`, `delivery_state`, optional `promo_code`
- Created `/checkout/success` page with reference ID display
- Created `app/api/shop/[subdomain]/delivery-settings/route.ts` proxy for public delivery settings

## Product Management
- Added image upload UI to the Create/Edit Product form in `app/(dashboard)/dashboard/shop/products/page.tsx`
- Added pending image previews with remove buttons that upload after product save

## Cart / Crypto Checkout
- Added `payment_intent_id` to `CheckoutResult` type in `app/(dashboard)/dashboard/cart/page.tsx`
- Updated `handleCreateWallet` in `app/(dashboard)/dashboard/cart/page.tsx` to call new backend endpoint `/api/user/cart/wallet` (POST `{ payment_intent_id, crypto_currency_id }`) instead of the old `/api/user/payment-intent/create-wallet`
- Created Next.js proxy route at `app/api/user/cart/wallet/route.ts` forwarding to backend `/api/user/cart/wallet`
- Preserved wallet modal SSE flow and crypto/fiat data mapping
