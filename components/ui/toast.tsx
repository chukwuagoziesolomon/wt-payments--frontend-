import * as React from "react";

export interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, show, onClose }) => {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div
      className={`fixed z-50 left-1/2 top-8 -translate-x-1/2 transition-all duration-300 ${
        show ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-[#23243a] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 border border-[#4f4f8f]">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#4fefb3"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="#23243a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};
