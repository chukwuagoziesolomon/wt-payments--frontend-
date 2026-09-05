# Activities Completed So Far

## Multi-Network Crypto Integration (Solana / Tron / EVM / CKB)

### Backend Payloads & Response Integration
- Reviewed backend contract for Solana and Tron networks across available-assets, withdrawal initiate/confirm, payment intent history, withdrawal history, SSE events, and wallet creation
- Added TypeScript types for new network variants: `NetworkType = "evm" | "ckb" | "solana" | "tron"`
- Added `AvailableAsset`, `AvailableAssetCrypto`, `AvailableAssetNetwork` types supporting `networkType`, `chainKey`, `chainId`, `contractAddress`, and `isTestnet`
- Added `WithdrawalHistoryItem` and `WithdrawalSSEEventData` types matching new backend shapes

### Available Assets
- Updated `AssetItem` type in `app/(dashboard)/dashboard/currency/page.tsx` for new network fields
- Updated `CurrencyTable.tsx` and `CurrencyMobile.tsx` to read contract/mint addresses from `asset.crypto.contractAddress || asset.network?.contract_address`
- Updated `AvailableAssetCard.tsx` type for new network fields

### Wallet Dashboard / Balances
- Replaced single aggregated balance with per-wallet cards in `WalletSummaryCards`
- Each wallet card shows: network logo, network name, balance, currency symbol, truncated address, and testnet badge
- Added `UserWallet` type with `cryptoNetwork` and `currency` preloaded objects
- Added `WalletsResponse` type for `GET /api/user/wallets`

### Withdrawal Flow — Wallet Selector
- Added wallet selector dropdown in `app/(dashboard)/dashboard/wallet/withdraw/page.tsx`
- Fetches `GET /api/user/wallets` on mount and filters by active status
- Each wallet option shows network logo, balance, truncated address, and active/inactive badge
- Auto-populates `user_wallet_id`, `network_id`, and `crypto_currency_id` from selected wallet
- Added network-aware address validation: EVM `0x...`, Solana Base58, Tron `T...`, CKB `ckt1q...`
- Submit button and amount balance now reflect selected wallet's currency symbol

### Transaction History
- Updated `lib/payment-intent-history.ts` with new fields: `crypto_amount`, `crypto_currency`, `tx_hash`, `wallet_address`, `user_wallet_id`
- Updated `HistoryListItem` to include `network`, `txHash`, `cryptoAmount`, `cryptoCurrency`
- Updated `WithdrawalHistoryTable.tsx` to use new `WithdrawalHistoryItem` shape (`method`, `crypto_currency`, `wallet`, `network`, `tx_hash`)
- Added dynamic crypto icons for SOL, TRX, USDC, USDT, CKB, ETH, MATIC
- Updated `TransactionsTable.tsx` and overview `TransactionsTable.tsx` to display `txHash` under amount when present

### SSE Events — Wallet Balance Updates
- Updated `use-wallet-balance.ts` to merge incoming `wallets[]` with previous state instead of replacing
- Individual wallet balances update granularly without losing other wallets
- Retained `withdrawal.updated` listener for real-time completion notifications

### Payout Settings — Crypto Wallet
- Updated `PayoutSettingsSection.tsx` with Bank Account / Crypto Wallet toggle
- Added crypto payout form accepting EVM, Solana, Tron, and CKB addresses
- Added network-aware validation with inline error messages and placeholder hints
- Posts `type: "CRYPTO"` with `wallet_address`, `network_type`, `currency_id`

### Transaction Creation — Blockchain & Currency Selectors
- Updated `app/transactions/create/page.tsx` to fetch `/backend/available-assets` on mount
- Added Blockchain selector using `SelectBlockchainSheet`, populated from available assets
- Added Cryptocurrency selector using `SelectAssetSheet`, filtered by chosen blockchain
- Both selectors render network/asset logos from API with text fallbacks
- Passes real `crypto_currency_id` to `POST /user/payment-intent/create-wallet`
- Added validation requiring both blockchain and currency before submission

### WaitingForPaymentModal Enhancements
- Extended `PaymentIntentData.crypto` with optional `logo` and `networkType`
- Added `renderNetworkBadge()` with network-specific colors (Solana purple, Tron red, EVM blue, CKB green)
- Shows asset logo next to amount and colored network badge
- Added `Estimated arrival` row based on network type
- Updated footer text to reflect actual selected network instead of hardcoded "Fiber protocol"

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
- Fixed `/checkout` validation bug: `canProceed` was checking `delivery.full_name` which was never populated; now syncs `guestName` → `delivery.full_name` and checks the correct fields
- Fixed `/checkout` payload to always include `full_name` and `state` inside `delivery_address` by syncing `guestName` and `deliveryState` back into the `delivery` object before sending

## Product Management
- Added image upload UI to the Create/Edit Product form in `app/(dashboard)/dashboard/shop/products/page.tsx`
- Added pending image previews with remove buttons that upload after product save

## Cart / Crypto Checkout
- Added `payment_intent_id` to `CheckoutResult` type in `app/(dashboard)/dashboard/cart/page.tsx`
- Updated `handleCreateWallet` in `app/(dashboard)/dashboard/cart/page.tsx` to call new backend endpoint `/api/user/cart/wallet` (POST `{ payment_intent_id, crypto_currency_id }`) instead of the old `/api/user/payment-intent/create-wallet`
- Created Next.js proxy route at `app/api/user/cart/wallet/route.ts` forwarding to backend `/api/user/cart/wallet`
- Preserved wallet modal SSE flow and crypto/fiat data mapping

## Files Modified

| File | Changes |
|------|---------|
| `types/index.ts` | Added `NetworkType`, `AvailableAsset*`, `UserWallet`, `WithdrawalSSEEventData`, `WithdrawalHistoryItem` |
| `src/components/wallet/WalletSummaryCards.tsx` | Per-network wallet cards with logo, balance, truncated address, testnet badge |
| `hooks/use-wallet-balance.ts` | Granular wallet merging via `mergeWallets()`; `withdrawal.updated` SSE support |
| `app/(dashboard)/dashboard/wallet/withdraw/page.tsx` | Wallet selector dropdown, network-aware address validation, SSE completion toast |
| `src/components/wallet/WithdrawalHistoryTable.tsx` | New API shape mapping, dynamic crypto icons |
| `lib/payment-intent-history.ts` | New fields: `crypto_amount`, `crypto_currency`, `tx_hash`, `wallet_address`, `user_wallet_id` |
| `src/components/transactions/TransactionsTable.tsx` | `txHash` display under amount |
| `src/components/overview/TransactionsTable.tsx` | `txHash` display, network badge |
| `app/(dashboard)/dashboard/currency/page.tsx` | Updated `AssetItem` type for Solana/Tron fields |
| `src/components/currency/CurrencyTable.tsx` | Contract/mint address from `crypto.contractAddress` |
| `src/components/currency/CurrencyMobile.tsx` | Contract/mint address from `crypto.contractAddress` |
| `src/components/overview/AvailableAssetCard.tsx` | Updated `AssetItem` type for new network fields |
| `src/components/settings/PayoutSettingsSection.tsx` | Crypto wallet form with network-aware validation |
| `app/transactions/create/page.tsx` | Blockchain/currency selectors from `/available-assets`, validation, logo/networkType propagation |
| `components/WaitingForPaymentModal.tsx` | Network badge, asset logo, estimated arrival row |
| `app/(dashboard)/dashboard/wallet/page.tsx` | Uses updated `WalletSummaryCards` |
| `app/api/withdrawals/route.ts` | Proxy unchanged, response shape updated downstream |
| `app/api/user/withdrawals/history/route.ts` | Proxy unchanged, response shape updated downstream |
| `app/api/user/payment-intent/history/route.ts` | Proxy unchanged, response shape updated downstream |
