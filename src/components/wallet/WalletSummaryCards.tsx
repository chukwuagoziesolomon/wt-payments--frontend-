"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function WithdrawButton() {
  const router = useRouter();
  return (
    <Button
      variant="default"
      size="sm"
      className="px-3 py-1"
      onClick={() => router.push('/dashboard/wallet/withdraw')}
    >
      Withdraw
    </Button>
  );
}

export function WalletSummaryCards() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Navigation Buttons - Mobile Only */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg hover:bg-accent transition-colors md:hidden"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg hover:bg-accent transition-colors md:hidden"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Desktop: Grid Layout (2 cards covering full width) */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-4">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <WithdrawButton />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$205</div>
            <div className="text-xs text-muted-foreground">0.00008193 BTC</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Number of Asset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile: Scrollable Cards Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 md:hidden"
      >
        <Card className="flex-shrink-0 w-80">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <WithdrawButton />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$205</div>
            <div className="text-xs text-muted-foreground">0.00008193 BTC</div>
          </CardContent>
        </Card>

        <Card className="flex-shrink-0 w-80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Number of Asset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
