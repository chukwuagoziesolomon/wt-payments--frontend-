"use client";
import * as React from "react";
import { WaitingForPaymentModal } from "@/components/WaitingForPaymentModal";

export default function WaitingForPaymentPage() {
  // Always open the modal as a full page
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#18191d]">
      <div className="w-full flex items-center justify-center flex-1">
        <div className="relative z-10">
          <WaitingForPaymentModal open={true} onClose={() => {}} />
        </div>
      </div>
      <div className="w-full flex items-center justify-center py-4 border-t border-[#23243a] mt-4">
        <svg className="w-4 h-4 text-[#4f4f8f] mr-2" fill="none" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-7v-4h2v4h-2zm0 4v-2h2v2h-2z" fill="currentColor" /></svg>
        <span className="text-xs text-muted-foreground">Secured by <span className="text-[#4f4f8f] font-medium">Zedify</span></span>
      </div>
    </div>
  );
}
