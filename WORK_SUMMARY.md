# Western Treasury — Frontend Development Work Summary

**Project:** wt-payment-dashboard (Next.js 14 · TypeScript · Tailwind CSS)
**Date:** June 7, 2026

---

## Overview

Full-stack integration of the Western Treasury payment dashboard frontend with the backend API server (`wt-payments-server`). All features were built from scratch or wired to live endpoints — no mock data remains in production flows.

---

## 1. Environment Toggle (Live / Test Mode)

**File:** `components/layouts.tsx/header-mode-toggle.tsx`
**API:** `POST /user/settings/general/switch-environment`

- Built the header toggle button that switches the user's account between **LIVE** and **TEST** mode
- Reads the current environment from `localStorage` on load so state persists across refreshes
- Calls the backend with a `Bearer` token; displays a toast error if the account is not verified and cannot switch to LIVE
- Toggle is disabled and dimmed while the request is in flight to prevent double-submits

---

## 2. Analytical Transaction Chart

**File:** `src/components/overview/AnalyticalTransactionChart.tsx`
**API:** `GET /dashboard/analytical-transactions?period=week|month&year=&month=`

- Replaced static hardcoded bar chart data with live API data
- Added **Week / Month toggle buttons** in the card header
- Chart bars update dynamically; the bar with the highest transaction count receives the purple gradient highlight
- Tooltip shows label, count, and USD amount on hover
- Loading state uses the `SectionLoader` (bars variant); errors display inline

---

## 3. Real-Time Wallet Balance via SSE

**Files:** `hooks/use-wallet-balance.ts`, `src/components/wallet/WalletSummaryCards.tsx`, `src/components/overview/SummaryCards.tsx`
**API:** `GET /user/stream` (Server-Sent Events)

- Created a shared `useWalletBalance()` React hook that opens a persistent SSE connection to the backend
- Listens for `wallet.balance_updated` events and updates React state instantly — no polling
- **Wallet page** (`WalletSummaryCards`): balance and asset count update in real-time when a payment is confirmed
- **Dashboard page** (`SummaryCards`): "Total Wallet Balance" card overrides the initial HTTP-fetched value the moment a live SSE event arrives
- Token is passed as a query param (`?token=`) since native `EventSource` does not support custom headers

---

## 4. Loading Animator Suite

**Files:** `components/ui/LoadingAnimator.tsx`, `app/globals.css`

Built a complete set of branded loading states matching the violet/dark design system:

| Component | Used for |
|---|---|
| `PageLoader` | Full-screen splash with orbit rings, W logo, progress bar, and % counter |
| `RouteLoaderBar` | Thin violet gradient progress bar at top of page during navigation |
| `SkeletonCard` | Shimmer placeholders (dashboard, transaction, stats, profile variants) |
| `ButtonSpinner` | Inline spinner inside buttons while async actions run |
| `SectionLoader` | Mid-card loader (orbit, dots, bars, ring variants) |
| `OverlayLoader` | Frosted-glass overlay for modals/drawers while data loads |

---

## 5. Page-Level Loading (Next.js App Router)

**Files:** `app/loading.tsx`, `app/(dashboard)/loading.tsx`, `app/transactions/loading.tsx`

- Created `loading.tsx` files at every route segment so Next.js automatically shows the `PageLoader` during page transitions
- Covers: root pages, all dashboard routes, and all transaction flow pages

---

## 6. Route Progress Bar

**File:** `components/layouts.tsx/route-loader-wrapper.tsx`, `app/layout.tsx`

- `RouteLoaderBar` injected once into the root layout — shows on every client-side navigation automatically
- Detects route changes by polling `window.location.pathname` and animates the bar accordingly

---

## 7. Withdrawal Flow (3-Step: Quote → Initiate → Confirm)

**File:** `app/(dashboard)/dashboard/wallet/withdraw/page.tsx`
**APIs:** `GET /user/withdrawal/quote`, `POST /user/withdrawal/initiate`, `POST /user/withdrawal/confirm`

Complete end-to-end withdrawal implementation:

- **Step 1 — Live Fee Quote:** Debounced 300ms call to `/user/withdrawal/quote` on every amount keypress; fee breakdown card updates live showing amount to receive, transaction fee, network fee, arrival time, and NGN exchange rate (for fiat)
- **Step 2 — Initiate:** "Withdraw" button calls `/user/withdrawal/initiate` with the full request body (crypto or fiat), stores the returned `otp_id`
- **Step 3 — OTP Confirm:** OTP modal opens; user enters 6-digit code; calls `/user/withdrawal/confirm`; navigates to wallet on success
- **Crypto mode:** network selector sheet, asset selector sheet, recipient wallet address field
- **Fiat mode:** bank name, account number, bank code, account holder name fields; NGN conversion displayed in fee summary
- Error messages from the backend (insufficient balance, expired OTP, invalid OTP, etc.) surface as toast notifications

---

## 8. OTP Modal Enhancement

**File:** `src/components/wallet/WithdrawalOtpModal.tsx`

- Added `loading` prop to the modal
- Replaced static `<Button>` with `<ButtonSpinner>` — shows spinner and "Processing…" text while the OTP confirm request is in flight
- Prevents double-submission when the button is disabled during the API call

---

## 9. Details Modal Enhancement

**File:** `src/components/DetailsModal.tsx`

- Added optional `loading` prop
- `<OverlayLoader>` renders over the modal content while details are being fetched, using the frosted-glass effect with the W logo spinner

---

## 10. Direct API Integration Audit

Audited the entire codebase and replaced all internal Next.js proxy route calls (`/api/...`) with direct calls to `${NEXT_PUBLIC_API_BASE_URL}` — the correct pattern since the backend runs separately:

| File | Endpoint fixed |
|---|---|
| `lib/payment-intent-history.ts` | `/user/payment-intent/history` |
| `WithdrawalHistoryTable.tsx` | `/user/withdrawals/history` |
| `WithdrawalsCard.tsx` | `/user/withdrawals/history` |
| `PayoutPieChart.tsx` | `/dashboard/payout-chart` |
| `AnalyticalTransactionChart.tsx` | `/dashboard/analytical-transactions` |
| `use-wallet-balance.ts` | `/user/stream` (SSE) |

All requests include `Authorization: Bearer <token>` read from `localStorage`.

---

## 11. Section Loaders Wired to All Data-Fetching Components

Replaced all plain `"Loading..."` text strings across the app with the appropriate `SectionLoader` variant:

| Component | Variant |
|---|---|
| `AnalyticalTransactionChart` | `bars` |
| `TransactionsTable` | `bars` |
| `TransactionsMobile` | `bars` |
| `AvailableAssetCard` | `orbit` |
| `PayoutPieChart` | `ring` |

---

## Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Real-time:** Server-Sent Events (native `EventSource`)
- **Auth:** JWT via `localStorage` + `Authorization: Bearer` header
- **State:** React hooks (`useState`, `useEffect`, `useRef`)

---

## 12. Shop Builder — Empty State Modal Fix & API Routing Corrections

**Date:** July 12, 2026  
**Files Modified:**
- `app/(dashboard)/dashboard/shop/page.tsx`
- `app/shop/[subdomain]/page.tsx`
- `next.config.ts`
- `app/api/user/withdrawal/quote/route.ts`
- `app/api/user/withdrawal/initiate/route.ts`
- `app/api/user/settings/general/switch-environment/route.ts`
- `app/api/user/payment-intent/history/route.ts`
- `app/api/user/withdrawals/history/route.ts`
- `app/api/dashboard/analytical-transactions/route.ts`
- `app/api/transactions/route.ts`
- `app/api/withdrawals/route.ts`

---

### 12.1 CreateShopModal Not Opening (Empty State Bug)

**Problem:** When visiting `/dashboard/shop` with no existing shop, clicking "Create Your Shop" button did nothing. The component had an early `return` inside the `if (!shop)` block that exited before the `CreateShopModal` could render.

**Fix:** Moved the `CreateShopModal` JSX inside the `if (!shop)` empty state block so the modal renders and can be triggered even when no shop has been created yet.

---

### 12.2 Backend API Prefix Correction (`E_ROUTE_NOT_FOUND`)

**Problem:** All `fetch()` calls from page components used `/backend/user/shop` etc., and the Next.js rewrite in `next.config.ts` was mapping `/backend/:path*` → `${apiBase}/:path*`. This caused requests like `POST /backend/user/shop` to hit the backend as `POST /user/shop`, missing the `/api/` prefix. Backend returned `E_ROUTE_NOT_FOUND: Cannot POST:/user/shop`.

**Fix:**
1. Updated `next.config.ts` rewrite destination to `${apiBase}/api/:path*` so `/backend/*` correctly proxies to `/api/*` on the backend.
2. Updated all `app/api/` Next.js proxy routes to include `/api/` when calling the backend directly (e.g., `${apiBase}/api/user/shop` instead of `${apiBase}/user/shop`).

---

### 12.3 Public Storefront Double-`/api` Bug (`E_ROUTE_NOT_FOUND: /api/api/shop/:subdomain`)

**Problem:** After fixing the rewrite, the public storefront page at `app/shop/[subdomain]/page.tsx` was calling `${API}/api/shop/${subdomain}` which combined with the rewrite to produce `/api/api/shop/:subdomain` on the backend — a non-existent route. The backend only registers `/api/storefront/:subdomain`, not `/api/shop/:subdomain`.

**Fix:** Changed fetch URLs to `${API}/storefront/${subdomain}` and `${API}/storefront/${subdomain}/products`. With the corrected rewrite, these now resolve to the correct backend paths `/api/storefront/:subdomain` and `/api/storefront/:subdomain/products`.

**Regression check:** No breaking changes to authenticated `/dashboard/shop` flows — those already correctly call `/backend/user/shop` (now rewriting to `/api/user/shop`) and were untouched.

---

### 12.4 Removed Redundant Products Fetch

**Observation:** The `storefront()` controller method already embeds `products` directly in its response payload. The frontend was making a second request to `/api/storefront/:subdomain/products` for data that was already present.

**Fix:** Removed the second `fetch()` call. Products are now extracted from the first storefront response via `json.data.products` and passed directly to the component state. This eliminates an unnecessary round-trip and potential 404.
