"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export function PayoutSummaryCards() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Approximate card width + gap
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg hover:bg-accent transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg hover:bg-accent transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Scrollable Cards Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
      >
        <Card className="flex-shrink-0 w-80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$205</div>
          </CardContent>
        </Card>
        <Card className="flex-shrink-0 w-80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$105</div>
          </CardContent>
        </Card>
        <Card className="flex-shrink-0 w-80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Pending Interval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$20</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

