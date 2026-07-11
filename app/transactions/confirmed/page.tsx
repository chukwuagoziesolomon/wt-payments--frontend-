"use client";
import * as React from "react";

export default function PaymentConfirmedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#18191d]">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative z-10 w-full max-w-xl mx-auto">
          <div className="bg-[#232228] rounded-2xl shadow-2xl px-16 py-14 flex flex-col items-center relative">
            {/* Confetti dots scattered in the upper half, above heading */}
            <div className="absolute left-0 right-0 top-0 h-1/2 pointer-events-none overflow-visible">
              {[...Array(16)].map((_, i) => {
                // Randomize top (5% to 45%) and left (5% to 95%) for a natural scatter
                const top = 5 + Math.random() * 40;
                const left = 5 + Math.random() * 90;
                return (
                  <span
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300 opacity-80 animate-pulse"
                    style={{
                      top: `${top}%`,
                      left: `${left}%`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  />
                );
              })}
            </div>
            <span className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400/20 mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#FFD600"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="#232228" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <div className="text-white text-2xl font-semibold mb-2 text-center">Payment Confirmed</div>
            <div className="text-muted-foreground text-center mb-8">Your transaction was successful and is now confirmed on the blockchain</div>
            <button className="w-full bg-[#4f4f8f] hover:bg-[#6c5dd3] text-white text-base font-semibold py-3 rounded-lg transition-colors mb-4">Ok</button>
            <div className="w-full flex items-center justify-center pt-2 border-t border-[#23243a] mt-2">
              <svg className="w-4 h-4 text-[#4f4f8f] mr-2" fill="none" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-7v-4h2v4h-2zm0 4v-2h2v2h-2z" fill="currentColor" /></svg>
              <span className="text-xs text-muted-foreground">Secured by <span className="text-[#4f4f8f] font-medium">Zedify</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
