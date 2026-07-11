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
      url: "/dashboard/payouts",
      icon: "payoutIcon",
      isActive: false,
    },
    {
      title: "Wallet",
      url: "/dashboard/wallet",
      icon: "walletIcon",
      isActive: true,
    },
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
