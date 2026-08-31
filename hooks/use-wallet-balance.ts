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

export type WithdrawalUpdateEvent = {
  type: "crypto";
  network: string;
  status: string;
  amount: number;
  tx_hash?: string;
  recipient?: string;
  currency: string;
  transaction_id: string;
};

function mergeWallets(existing: WalletEntry[], incoming: WalletEntry[]): WalletEntry[] {
  const map = new Map<string, WalletEntry>();
  for (const w of existing) {
    const key = w.currency_id || w.symbol || crypto.randomUUID();
    map.set(key, w);
  }
  for (const w of incoming) {
    const key = w.currency_id || w.symbol || crypto.randomUUID();
    map.set(key, w);
  }
  return Array.from(map.values());
}

export function useWalletBalance(options?: {
  onWithdrawalUpdate?: (event: WithdrawalUpdateEvent) => void;
}): WalletBalance | null {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const onWithdrawalUpdate = options?.onWithdrawalUpdate;
  const previousWalletsRef = useRef<WalletEntry[]>([]);

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
        setBalance(prev => {
          const prevWallets = prev?.wallets || previousWalletsRef.current;
          const merged = payload.wallets?.length
            ? mergeWallets(prevWallets, payload.wallets)
            : payload.wallets;
          previousWalletsRef.current = merged;
          return { total_balance_usd: payload.total_balance_usd, wallets: merged };
        });
      } catch {
        // ignore malformed events
      }
    });

    if (onWithdrawalUpdate) {
      es.addEventListener("withdrawal.updated", (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as WithdrawalUpdateEvent;
          onWithdrawalUpdate(payload);
        } catch {
          // ignore malformed events
        }
      });
    }

    es.onerror = () => {
      // EventSource auto-reconnects on error; nothing extra needed
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [onWithdrawalUpdate]);

  return balance;
}
