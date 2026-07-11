import { Filter, ChevronDown } from "lucide-react";

function DesktopHeader() {
  return (
    <div className="hidden md:flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Filter</span>
        </div>
        <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-2">
          <span className="text-sm text-muted-foreground">Time</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-2">
          <span className="text-sm font-medium">USD</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Last Updated Today at 12:00 noon
      </div>
    </div>
  );
}

function MobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-foreground">Overview</h1>
      </div>
      <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">USD</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

export function DashboardHeader() {
  return (
    <div className="mb-6">
      <DesktopHeader />
      <MobileHeader />
      <div className="w-full h-px bg-border mt-4"></div>
    </div>
  );
}