"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Icons from "@/components/icons";
import { ChevronDown, Filter, Eye } from "lucide-react";

export function PayoutFilterSection() {
  return (
    <div className="bg-background border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Filter Section */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-background border-border text-foreground hover:bg-accent"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border">
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                All Payouts
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-background border-border text-foreground hover:bg-accent"
              >
                Time
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border">
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                Last 7 days
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                Last 30 days
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                Last 3 months
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-background border-border text-foreground hover:bg-accent"
              >
                USD
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border">
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                USD ($)
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                EUR (€)
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                GBP (£)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Eye/View Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-accent"
          >
            <Eye className="w-4 h-4" />
          </Button>

          {/* Payout Setting Button */}
          <Button
            variant="outline"
            className="bg-background border-border text-foreground hover:bg-accent"
          >
            <Icons.settingsIcon className="w-4 h-4 mr-2" />
            Payout Setting
          </Button>
        </div>
      </div>
    </div>
  );
}