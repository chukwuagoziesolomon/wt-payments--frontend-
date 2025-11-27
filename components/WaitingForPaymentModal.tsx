import * as React from "react";

interface WaitingForPaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export const WaitingForPaymentModal: React.FC<WaitingForPaymentModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#232228] rounded-2xl shadow-2xl px-10 py-12 w-full max-w-xl flex flex-col items-center relative">
        <div className="text-white text-center text-lg font-medium mb-8">
          We’re waiting to receive your crypto payment.<br />
          <span className="text-base font-normal">This can take up to a minute</span>
        </div>
        <div className="flex items-center w-full justify-center gap-8">
          <span className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#FFD600"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="#232228" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <div className="flex-1 h-2 rounded bg-[#393943] mt-2" />
          <span className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-yellow-400 animate-spin-slow">
            <span className="w-8 h-8 rounded-full border-2 border-dashed border-yellow-400 opacity-60"></span>
          </span>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white text-xl">×</button>
      </div>
    </div>
  );
};

// Add this animation to your global CSS or Tailwind config:
// @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
// .animate-spin-slow { animation: spin-slow 2s linear infinite; }
