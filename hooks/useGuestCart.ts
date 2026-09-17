"use client";

const GUEST_TOKEN_KEY = "guest_cart_token";

export function getGuestToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_TOKEN_KEY) || localStorage.getItem("guest_token");
}

export function setGuestToken(token: string) {
  localStorage.setItem(GUEST_TOKEN_KEY, token);
}

export function clearGuestToken() {
  localStorage.removeItem(GUEST_TOKEN_KEY);
  localStorage.removeItem("guest_token");
}

export function saveGuestToken(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const response = payload as {
    guest_token?: unknown;
    result?: { guest_token?: unknown };
    data?: { guest_token?: unknown };
  };
  const token = response.guest_token || response.result?.guest_token || response.data?.guest_token;
  if (typeof token !== "string" || !token) return null;
  setGuestToken(token);
  return token;
}

type GuestCartItem = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  image?: string | null;
  shop_id?: string;
};

type GuestCart = {
  items: GuestCartItem[];
  total: number;
  currency: string;
  item_count: number;
};

export async function addToGuestCart(productId: string, quantity = 1) {
  const existingToken = getGuestToken();
  const url = new URL("/api/cart/items", typeof window !== "undefined" ? window.location.origin : "http://localhost");
  if (existingToken) url.searchParams.set("guest_token", existingToken);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: productId,
      quantity,
      ...(existingToken ? { guest_token: existingToken } : {}),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.data || data.message || "Failed to add to cart");
  }
  saveGuestToken(data);
  return data;
}

export async function fetchGuestCart(): Promise<GuestCart> {
  const token = getGuestToken();
  if (!token) return { items: [], total: 0, currency: "NGN", item_count: 0 };
  const res = await fetch(`/api/cart?guest_token=${encodeURIComponent(token)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.data || data.message || "Failed to load cart");
  }
  const payload = data.result && typeof data.result === "object"
    ? data.result
    : data.data && typeof data.data === "object"
      ? data.data
      : { items: [], total: 0, currency: "NGN", item_count: 0 };
  return payload as GuestCart;
}

export async function updateGuestCartItem(itemId: string, quantity: number) {
  const token = getGuestToken();
  if (!token) return;
  const res = await fetch(`/api/cart/items/${encodeURIComponent(itemId)}?guest_token=${encodeURIComponent(token)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.data || data.message || "Failed to update cart item");
  }
  return data;
}

export async function removeGuestCartItem(itemId: string) {
  const token = getGuestToken();
  if (!token) return;
  const res = await fetch(`/api/cart/items/${encodeURIComponent(itemId)}?guest_token=${encodeURIComponent(token)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.data || data.message || "Failed to remove cart item");
  }
}

export async function clearGuestCart() {
  const token = getGuestToken();
  if (!token) return;
  const res = await fetch(`/api/cart?guest_token=${encodeURIComponent(token)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.data || data.message || "Failed to clear cart");
  }
}
