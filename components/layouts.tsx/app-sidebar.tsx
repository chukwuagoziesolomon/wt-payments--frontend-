
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiDashboardLine, RiWalletLine, RiMoneyDollarCircleLine, RiSettings3Line, RiBankCardLine, RiCoinsLine, RiStoreLine, RiArchiveLine, RiFileHistoryLine } from "@remixicon/react";
import { Sidebar } from "@/components/ui/sidebar";

export default function AppSidebar() {
  const menuItems = [
    { label: "Overview", icon: RiDashboardLine, href: "/dashboard" },
    { label: "Transaction", icon: RiBankCardLine, href: "/dashboard/transactions" },
    { label: "Payout", icon: RiMoneyDollarCircleLine, href: "/dashboard/payout" },
    { label: "Wallet", icon: RiWalletLine, href: "/dashboard/wallet" },
    { label: "Currency", icon: RiCoinsLine, href: "/dashboard/currency" },
    { label: "Shop Builder", icon: RiStoreLine, href: "/dashboard/shop" },
    { label: "Products", icon: RiArchiveLine, href: "/dashboard/shop/products" },
    { label: "Payments", icon: RiFileHistoryLine, href: "/dashboard/payments" },
  ];

  const pathname = usePathname();

  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
      <div className="flex flex-col gap-2 px-4 pt-6 pb-2">
        <div className="flex items-center mb-2 justify-center">
          <img src="/images/logo.svg" alt="zedify" className="w-14 h-14 object-contain" />
        </div>
        <div className="border-b border-[#23232b] w-full mb-2" />
        <div className="text-xs text-[#b0b0c3] leading-none">zedify</div>
        <div className="text-[10px] text-[#b0b0c3] leading-none mb-2">13482</div>
        <div className="border-b border-[#23232b] w-full" />
      </div>
      <nav className="flex-1 flex flex-col justify-between">
        <ul className="flex flex-col gap-1 px-2">
          {menuItems.map(({ label, icon: Icon, href }) => {
            const active = pathname === href;
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                    active
                      ? "bg-[#23234a] text-[#a89cff]"
                      : "hover:bg-[#23232b] text-[#b0b0c3]"
                  }`}
                  tabIndex={0}
                >
                  <Icon size={20} className={active ? "text-[#a89cff]" : "text-[#b0b0c3]"} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-[#23232b] mt-4 p-4">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors text-sm font-medium hover:bg-[#23232b] text-[#b0b0c3]`}
            tabIndex={0}
          >
            <RiSettings3Line size={20} className="text-[#b0b0c3]" />
            Setting
          </Link>
        </div>
      </nav>
    </Sidebar>
  );
    }
