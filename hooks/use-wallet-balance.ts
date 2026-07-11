"use client";
import { useEffect, useRef, useState } from "react";

export type WalletEntry = {
  currency_id?: string;
  balance_usd: number;
  balance_crypto?: number;
  symbol?: string;
};

export type WalletBalance = {
  total_balance_usd: number;
  wallets: WalletEntry[];
};

/**
 * Subscribes to the SSE stream and keeps the wallet balance up-to-date.
 * Falls back to null until the first `wallet.balance_updated` event arrives.
 */
export function useWalletBalance(): WalletBalance | null {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");
    if (!token) return;

    const apiBase = "/backend";
    const url = `${apiBase}/user/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("wallet.balance_updated", (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data) as WalletBalance;
        setBalance(payload);
      } catch {
        // ignore malformed events
      }
    });

    es.onerror = () => {
      // EventSource auto-reconnects on error; nothing extra needed
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

  return balance;
}
