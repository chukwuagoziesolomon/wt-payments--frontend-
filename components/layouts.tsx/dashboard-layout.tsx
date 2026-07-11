// import UserDropdown from "@/components/user-dropdown";
// import FeedbackDialog from "@/components/feedback-dialog";
// import ContactsTable from "@/components/contacts-table";
import { RiScanLine } from "@remixicon/react";
// import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AppSidebar from "./app-sidebar";
import UserDropdown from "./user-dropdown";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 overflow-hidden px-4 md:px-6 lg:px-8">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <Separator
              className="mr-2 data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
            <RiScanLine aria-hidden="true" size={22} />
          </div>
          <div className="ml-auto flex gap-3">
            <UserDropdown />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
