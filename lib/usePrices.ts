import { useEffect, useState, useCallback, useRef, useMemo } from "react";

type PricesData = Record<string, number>;

type PricesState = {
  data: PricesData;
  loading: boolean;
  error: string | null;
  cached: boolean;
  timestamp: string | null;
};

const DEFAULT_SYMBOLS = ["CKB", "USDT", "USDC", "NGN"];

function getToken() {
  return typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : "";
}

export function usePrices(symbols: string[] = DEFAULT_SYMBOLS, pollIntervalMs = 60_000) {
  const [state, setState] = useState<PricesState>({
    data: {},
    loading: true,
    error: null,
    cached: false,
    timestamp: null,
  });
  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const symbolsCsv = useMemo(() => Array.from(new Set(symbols)).join(","), [symbols]);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(`/api/user/prices?symbols=${encodeURIComponent(symbolsCsv)}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || `Failed to fetch prices (${res.status})`);
      }
      if (mountedRef.current) {
        setState({
          data: json.data || {},
          loading: false,
          error: null,
          cached: Boolean(json.cached),
          timestamp: json.timestamp || null,
        });
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || "Failed to load prices",
        }));
      }
    }
  }, [symbolsCsv]);

  useEffect(() => {
    mountedRef.current = true;
    fetchPrices();
    timerRef.current = setInterval(fetchPrices, pollIntervalMs);
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchPrices, pollIntervalMs]);

  const getPrice = useCallback(
    (symbol: string): number | undefined => {
      const key = symbol.toUpperCase().trim();
      return state.data[key];
    },
    [state.data]
  );

  const convert = useCallback(
    (amount: number, fromSymbol: string, toSymbol: string): number | undefined => {
      const fromPrice = getPrice(fromSymbol);
      const toPrice = getPrice(toSymbol);
      if (fromPrice == null || toPrice == null || fromPrice === 0) return undefined;
      return (amount * fromPrice) / toPrice;
    },
    [getPrice]
  );

  return {
    prices: state.data,
    loading: state.loading,
    error: state.error,
    cached: state.cached,
    timestamp: state.timestamp,
    getPrice,
    convert,
    refetch: fetchPrices,
  };
}
