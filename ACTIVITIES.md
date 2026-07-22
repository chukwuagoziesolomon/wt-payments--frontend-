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

## Product Management
- Added image upload UI to the Create/Edit Product form in `app/(dashboard)/dashboard/shop/products/page.tsx`
- Added pending image previews with remove buttons that upload after product save

## Cart / Crypto Checkout
- Added `payment_intent_id` to `CheckoutResult` type in `app/(dashboard)/dashboard/cart/page.tsx`
- Updated `handleCreateWallet` in `app/(dashboard)/dashboard/cart/page.tsx` to call new backend endpoint `/api/user/cart/wallet` (POST `{ payment_intent_id, crypto_currency_id }`) instead of the old `/api/user/payment-intent/create-wallet`
- Created Next.js proxy route at `app/api/user/cart/wallet/route.ts` forwarding to backend `/api/user/cart/wallet`
- Preserved wallet modal SSE flow and crypto/fiat data mapping
