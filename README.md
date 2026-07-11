# Zedify — WT Payments Dashboard & Storefront

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

> A modern payment dashboard and AI-powered shop builder for merchants and customers. Accept crypto payments, manage shops, track payouts, and more — all in one place.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### For Merchants
- **AI Shop Builder** — Create a storefront in minutes with AI-assisted customization
- **Product Management** — Add, edit, and delete products with image uploads
- **Multiple Templates** — Choose from Default, Fashion Store, Digital Goods, Service Booking, or AI Custom
- **Cart & Checkout** — Full shopping cart with crypto and Paystack payment support
- **Payout Management** — View payouts, manage payout settings, and track payment history
- **Real-time Prices** — Live asset prices updated every 60 seconds via CoinGecko
- **Wallet & Withdrawals** — Manage balances, withdraw funds with OTP verification
- **Transaction History** — Complete audit trail of all payments and transfers

### For Customers
- **Public Storefronts** — Browse and purchase from merchant shops at `/shop/:subdomain`
- **Add to Cart** — Seamless cart experience across the storefront
- **Crypto Checkout** — Pay with USDT, USDC, CKB, and other supported assets
- **Payment Status** — Real-time payment tracking via Server-Sent Events (SSE)

### Platform
- **Multi-Asset Support** — CKB, USDT, USDC, NGN, and more
- **SSE Live Updates** — Cart sync, payment notifications, and order updates in real-time
- **Responsive Design** — Mobile-first UI with dark theme optimized for all devices
- **Authentication** — Secure token-based auth with automatic expiry handling

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + Custom Dark Theme |
| **UI Components** | Radix UI primitives + Custom components |
| **Icons** | Lucide React, Remix Icon |
| **State** | React Hooks (`useState`, `useEffect`, `useContext`) |
| **Data Fetching** | Native `fetch` with auth proxy routes |
| **Real-time** | Server-Sent Events (SSE) |
| **Deployment** | Vercel |
| **Package Manager** | pnpm |

---

## Project Structure

```
wt-payment-dashboard/
├── app/
│   ├── (dashboard)/dashboard/     # Authenticated dashboard pages
│   │   ├── cart/                  # Shopping cart & checkout
│   │   ├── currency/              # Currency management
│   │   ├── payout/                # Payout history & settings
│   │   ├── shop/                  # Shop builder & products
│   │   │   └── products/          # Product CRUD
│   │   ├── shops/                 # My Shops listing
│   │   ├── transactions/          # Transaction history
│   │   └── wallet/                # Wallet & withdrawals
│   ├── api/                       # Next.js API proxy routes
│   │   ├── user/                  # User-specific endpoints
│   │   │   ├── cart/              # Cart operations
│   │   │   ├── payout/            # Payout endpoints
│   │   │   ├── shop/              # Shop management
│   │   │   └── ...
│   │   ├── dashboard/             # Dashboard stats
│   │   └── prices/                # Live price feeds
│   ├── shop/[subdomain]/          # Public storefront pages
│   └── cart/                      # Cart redirect entry point
├── components/
│   ├── layouts.tsx/               # Sidebar & app layout
│   ├── ui/                        # Reusable UI components
│   └── ...                        # Feature components
├── lib/
│   ├── auth-fetch.ts              # Auth-aware fetch wrapper
│   ├── usePrices.ts               # Live price polling hook
│   └── useCartStream.ts           # SSE cart event hook
├── public/
│   └── images/                    # Static assets (CKB, USDT, USDC logos)
├── next.config.ts                 # Next.js config with rewrites
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.x
- pnpm >= 10.x
- Backend server running at `http://127.0.0.1:3335` (or your deployed backend URL)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chukwuagoziesolomon/wt-payments--frontend-.git
   cd wt-payment-dashboard
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

4. Update `NEXT_PUBLIC_API_BASE_URL` in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3335
   ```

   For production/Vercel, set this to your deployed backend URL.

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (e.g., `http://127.0.0.1:3335` or `https://api.yourdomain.com`) | Yes |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL (used for shop URL generation) | Recommended |

### Vercel Deployment

Set `NEXT_PUBLIC_API_BASE_URL` in your Vercel project settings (**Settings → Environment Variables**). No `vercel.json` is needed — the app uses Next.js rewrites internally.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run Biome linter |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm check` | Run lint + typecheck |
| `pnpm clean` | Remove node_modules, dist, and build artifacts |

---

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Set `NEXT_PUBLIC_API_BASE_URL` in Vercel environment variables
3. Deploy — Vercel automatically builds and deploys on push to `main`

### Manual Build

```bash
pnpm build
pnpm start
```

---

## Key Pages & Routes

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview dashboard with stats |
| `/dashboard/transactions` | Transaction history |
| `/dashboard/payout` | Payout management |
| `/dashboard/wallet` | Wallet & withdrawals |
| `/dashboard/currency` | Currency & asset management |
| `/dashboard/shop` | AI Shop Builder |
| `/dashboard/shop/products` | Product management |
| `/dashboard/shops` | My Shops listing |
| `/dashboard/cart` | Shopping cart |
| `/shop/:subdomain` | Public storefront |
| `/cart` | Cart entry point (redirects to `/dashboard/cart`) |

---

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm check` to ensure no lint/type errors
4. Commit and push
5. Open a Pull Request

---

## License

Private — All rights reserved.

---

**Built with by the Zedify team**
