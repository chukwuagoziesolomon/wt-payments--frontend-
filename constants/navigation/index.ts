import type { NavGroup } from "@/types";

export const navigationItems: NavGroup = {
  main: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: "overviewIcon",
      isActive: true,
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions",
      icon: "transactionsIcon",
      isActive: false,
    },
    {
      title: "Payouts",
      url: "/dashboard/payout",
      icon: "payoutIcon",
      isActive: false,
    },
    {
      title: "Wallets",
      url: "/dashboard/wallet",
      icon: "walletIcon",
      isActive: false,
    },
    // Reconstructed Currency nav item (re-added to ensure it renders)
    {
      title: "Currency",
      url: "/dashboard/currency",
      icon: "currencyIcon",
      isActive: false,
    },
  ],
  others: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: "settingsIcon",
      isActive: false,
    },
  ],
};
