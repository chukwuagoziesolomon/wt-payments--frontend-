import { useEffect, useRef, useState } from "react";

type CartEventMap = {
  "cart.item_added": { product_id: string; quantity: number; product_name?: string; cart_id?: string };
  "cart.item_removed": { item_id: string; cart_id?: string };
  "cart.updated": { item_id: string; quantity: number; cart_id?: string };
  "cart.cleared": { cart_id?: string };
  "cart.checkout_completed": { reference_id?: string; payment_method?: string };
};

const CART_EVENT_NAMES = ["cart.item_added", "cart.item_removed", "cart.updated", "cart.cleared", "cart.checkout_completed"] as const;

type EventHandler<K extends keyof CartEventMap> = (payload: CartEventMap[K]) => void;

export function useCartStream(onEvent?: <K extends keyof CartEventMap>(event: K, payload: CartEventMap[K]) => void) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : "";
    if (!token) return;

    const es = new EventSource(`/backend/user/stream`, {
      headers: { Authorization: `Bearer ${token}` },
    } as any);

    eventSourceRef.current = es;

    es.addEventListener("open", () => {
      setConnected(true);
      setError(null);
    });

    es.addEventListener("error", () => {
      setConnected(false);
      setError("Stream disconnected");
    });

    CART_EVENT_NAMES.forEach((eventName) => {
      es.addEventListener(eventName, ((e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          onEvent?.(eventName, payload);
        } catch {
          // ignore malformed event
        }
      }) as EventListener);
    });

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [onEvent]);

  return { connected, error };
}
