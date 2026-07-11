"use client";

// import UserDropdown from "@/components/user-dropdown";
// import FeedbackDialog from "@/components/feedback-dialog";
// import ContactsTable from "@/components/contacts-table";
import React from "react";
import { RiScanLine } from "@remixicon/react";
// import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AppSidebar from "./app-sidebar";
import UserDropdown from "./user-dropdown";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import HeaderModeToggle from "./header-mode-toggle";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex-1 overflow-auto px-4 md:px-6 lg:px-8 pb-24 md:pb-6">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger className="md:hidden -ms-4" />
            <Separator
              className="mr-2 data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
            <RiScanLine aria-hidden="true" size={22} />
          </div>

          <div className="ml-auto flex items-center gap-4 pr-3">
            {/* Test/Live label + toggle */}
            <HeaderModeToggle />

            {/* User avatar/profile on the extreme right */}
            <div>
              <UserDropdown />
            </div>
          </div>
        </header>
        <div className="flex flex-col gap-4 py-4 lg:gap-6 lg:py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
