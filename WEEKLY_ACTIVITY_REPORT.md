# Weekly Activity Report — August 31, 2026

## Summary

Integrated multi-network crypto support (Solana, Tron, EVM, CKB) across wallet dashboard, withdrawal flow, transaction history, payout settings, and transaction creation. Replaced single aggregated balance with per-wallet cards, added wallet selector dropdowns, network-aware address validation, and granular SSE wallet updates.

---

## 1. Multi-Network Crypto Integration

### Types & Network Support
**File:** `types/index.ts`
- Added `NetworkType = "evm" | "ckb" | "solana" | "tron"`
- Added `AvailableAsset`, `AvailableAssetCrypto`, `AvailableAssetNetwork` types
- Added `UserWallet` type with `cryptoNetwork` and `currency` preloaded objects
- Added `WithdrawalHistoryItem`, `WithdrawalSSEEventData`, `WalletsResponse` types

### Wallet Dashboard / Balances
**File:** `src/components/wallet/WalletSummaryCards.tsx`
- Replaced single aggregated balance card with per-wallet cards
- Each card shows: network logo, network name, balance, currency symbol, truncated address, testnet badge
- Added `WalletCard` component for individual wallet display
- Added total balance card showing USD total and wallet count

### Withdrawal Flow — Wallet Selector
**File:** `app/(dashboard)/dashboard/wallet/withdraw/page.tsx`
- Added wallet selector dropdown fetching `GET /api/user/wallets`
- Filters by active status; shows network logo, balance, truncated address per option
- Auto-populates `user_wallet_id`, `network_id`, and `crypto_currency_id` from selected wallet
- Added network-aware address validation: EVM `0x...`, Solana Base58, Tron `T...`, CKB `ckt1q...`
- Amount field shows selected wallet's symbol instead of hardcoded "USDT"
- Added inline address validation error messages per network

### Transaction History
**File:** `src/components/wallet/WithdrawalHistoryTable.tsx`
- Updated to use new `WithdrawalHistoryItem` shape (`method`, `crypto_currency`, `wallet`, `network`, `tx_hash`)
- Added dynamic crypto icons for SOL, TRX, USDC, USDT, CKB, ETH, MATIC

**File:** `lib/payment-intent-history.ts`
- Extended `PaymentIntentHistoryTransaction` with `crypto_amount`, `crypto_currency`, `tx_hash`, `wallet_address`, `user_wallet_id`
- Updated `HistoryListItem` to include `network`, `txHash`, `cryptoAmount`, `cryptoCurrency`
- Updated `toHistoryItem` to map new fields and show network/tx hash in details

### SSE Events — Wallet Balance Updates
**File:** `hooks/use-wallet-balance.ts`
- `wallet.balance_updated` now merges incoming `wallets[]` with previous state via `mergeWallets()`
- Individual wallet balances update granularly without losing other wallets
- Retained `withdrawal.updated` listener for real-time completion notifications

### Payout Settings — Crypto Wallet
**File:** `src/components/settings/PayoutSettingsSection.tsx`
- Added Bank Account / Crypto Wallet toggle
- Crypto form accepts EVM, Solana, Tron, CKB addresses with network-aware validation
- Posts `type: "CRYPTO"` with `wallet_address`, `network_type`, `currency_id`

### Transaction Creation — Blockchain & Currency Selectors
**File:** `app/transactions/create/page.tsx`
- Fetches `/backend/available-assets` on mount to discover supported networks and currencies
- Added Blockchain selector using `SelectBlockchainSheet`, populated from available assets
- Added Cryptocurrency selector using `SelectAssetSheet`, filtered by chosen blockchain
- Both selectors render network/asset logos from API with text fallbacks
- Passes real `crypto_currency_id` to `POST /user/payment-intent/create-wallet`
- Added validation requiring both blockchain and currency before submission

### WaitingForPaymentModal Enhancements
**File:** `components/WaitingForPaymentModal.tsx`
- Extended `PaymentIntentData.crypto` with optional `logo` and `networkType`
- Added `renderNetworkBadge()` with network-specific colors
- Shows asset logo next to amount and colored network badge
- Added `Estimated arrival` row based on network type
- Updated footer text to reflect actual selected network

---

## 2. Verification

- **TypeScript typecheck:** `tsc --noEmit` passes with no errors
- **Biome linter:** No new errors introduced in modified files
- **Runtime:** Fixed null-safety crash in `transactions/create/page.tsx` `useMemo` and `handleSubmit`

---

## Files Modified

| File | Changes |
|------|---------|
| `types/index.ts` | Added multi-network types |
| `src/components/wallet/WalletSummaryCards.tsx` | Per-network wallet cards |
| `hooks/use-wallet-balance.ts` | Granular wallet merging, withdrawal SSE |
| `app/(dashboard)/dashboard/wallet/withdraw/page.tsx` | Wallet selector, network-aware validation |
| `src/components/wallet/WithdrawalHistoryTable.tsx` | New API shape, dynamic icons |
| `lib/payment-intent-history.ts` | New history fields mapping |
| `src/components/transactions/TransactionsTable.tsx` | `txHash` display |
| `src/components/overview/TransactionsTable.tsx` | `txHash` display |
| `app/(dashboard)/dashboard/currency/page.tsx` | Updated `AssetItem` type |
| `src/components/currency/CurrencyTable.tsx` | Contract/mint address display |
| `src/components/currency/CurrencyMobile.tsx` | Contract/mint address display |
| `src/components/overview/AvailableAssetCard.tsx` | Updated `AssetItem` type |
| `src/components/settings/PayoutSettingsSection.tsx` | Crypto wallet form with validation |
| `app/transactions/create/page.tsx` | Blockchain/currency selectors |
| `components/WaitingForPaymentModal.tsx` | Network badge, estimated arrival |
| `app/(dashboard)/dashboard/wallet/page.tsx` | Uses updated WalletSummaryCards |