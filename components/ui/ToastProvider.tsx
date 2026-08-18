"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast } from "./toast";

interface ToastContextType {
  notify: (message: string | object | unknown) => void;
}

const ToastContext = createContext<ToastContextType>({ notify: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const notify = useCallback((message: string | object | unknown) => {
    const text = typeof message === "string"
      ? message
      : typeof message === "object" && message !== null
        ? JSON.stringify(message)
        : String(message ?? "");
    setToast({ show: true, message: text });
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <Toast
        message={toast.message}
        show={toast.show}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />
    </ToastContext.Provider>
  );
};
