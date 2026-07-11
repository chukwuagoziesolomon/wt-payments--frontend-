"use client";

import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="bg-background border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Mobile-only: simple left filter icon and right payout button */}
        <div className="w-full flex items-center justify-between md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="border border-border p-2"
            onClick={() => setMobileOpen((s) => !s)}
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="bg-background border-border text-foreground hover:bg-accent"
          >
            <Icons.settingsIcon className="w-4 h-4 mr-2" />
            Payout Setting
          </Button>
        </div>

        {/* Mobile collapsible panel: shows hidden controls when filter is toggled */}
        <div className={`md:hidden mt-3 ${mobileOpen ? '' : 'hidden'}`}>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full text-left bg-background border-border">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border">
                  <DropdownMenuItem className="text-foreground hover:bg-accent">All Payouts</DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">Completed</DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">Pending</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full text-left bg-background border-border">
                    Time
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border">
                  <DropdownMenuItem className="text-foreground hover:bg-accent">Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">Last 3 months</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full text-left bg-background border-border">
                    USD
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border">
                  <DropdownMenuItem className="text-foreground hover:bg-accent">USD ($)</DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">EUR (€)</DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">GBP (£)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-accent">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="bg-background border-border text-foreground hover:bg-accent">
                <Icons.settingsIcon className="w-4 h-4 mr-2" />
                Payout Setting
              </Button>
            </div>
          </div>
        </div>
        {/* Filter Section */}
        <div className="hidden md:flex items-center gap-4 flex-wrap min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-background border-border text-foreground hover:bg-accent flex-shrink-0"
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
                className="bg-background border-border text-foreground hover:bg-accent flex-shrink-0"
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
                className="bg-background border-border text-foreground hover:bg-accent flex-shrink-0"
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
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
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