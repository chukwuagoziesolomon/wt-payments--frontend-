"use client";

import * as React from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { useSearchParams } from "next/navigation";

type CartItem = {
  product_id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  image?: string | null;
  shop_id?: string;
};

type DeliverySettings = {
  has_free_delivery?: boolean;
  delivery_fee?: number;
  free_delivery_threshold?: number;
};

type CheckoutAsset = {
  currency_id: string;
  name: string;
  symbol: string;
  logo?: string;
  network?: { name: string; logo?: string };
  amount: number;
};

export default function CheckoutPage() {
  const params = useSearchParams();
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [delivery, setDelivery] = React.useState<DeliverySettings>({});
  const [method, setMethod] = React.useState<"paystack" | "crypto">("crypto");
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    email: "",
    phone: "",
    full_name: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    promo_code: "",
  });

  React.useEffect(() => {
    const shop = params.get("shop");
    if (shop) {
      fetch(`/backend/shop/${shop}/delivery-settings`)
        .then((response) => response.json())
        .then((json) => setDelivery(json.result || json.data || {}))
        .catch(() => undefined);
    }

    const guestToken = localStorage.getItem("guest_cart_token") || localStorage.getItem("guest_token");
    if (guestToken) {
      fetch(`/api/cart?guest_token=${encodeURIComponent(guestToken)}`)
        .then((response) => response.json())
        .then((json) => setItems((json.data || json.result)?.items || []))
        .catch(() => setItems([]));
    } else {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      if (token) {
        fetch(`/backend/user/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response) => response.json())
          .then((json) => setItems((json.data || json.result)?.items || []))
          .catch(() => setItems([]));
      } else {
        setItems([]);
      }
    }
  }, [params]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const qualifiesForFreeDelivery = Boolean(
    delivery.has_free_delivery ||
      (delivery.free_delivery_threshold &&
        subtotal >= delivery.free_delivery_threshold)
  );
  const deliveryFee = qualifiesForFreeDelivery ? 0 : Number(delivery.delivery_fee || 0);
  const total = subtotal + deliveryFee;
  const currency = items[0]?.currency || "NGN";

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!items.length) {
      setMessage("Your cart is empty.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const guestToken = localStorage.getItem("guest_cart_token") || localStorage.getItem("guest_token");
      const checkoutUrl = guestToken
        ? `/api/cart/checkout?guest_token=${encodeURIComponent(guestToken)}`
        : "/api/cart/checkout";
      const response = await fetch(checkoutUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fiat_currency: currency,
          payment_method: method,
          customer_email: form.email,
          customer_phone: form.phone,
          delivery_address: {
            full_name: form.full_name,
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            country: form.country,
          },
          delivery_state: form.state,
          promo_code: form.promo_code || undefined,
          items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json.data || json.message || "Unable to start checkout");
      }
      if (json.result?.authorization_url) {
        window.location.href = json.result.authorization_url;
        return;
      }
      const referenceId = json.result?.reference_id;
      if (referenceId) {
        window.location.href = `/checkout/confirm/${encodeURIComponent(referenceId)}`;
        return;
      }
      setMessage("Checkout started, but no reference was returned.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start checkout");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-base-bg px-4 py-10 text-ink-primary sm:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Secure checkout</p>
          <h1 className="mt-2 text-3xl font-semibold">Complete your order</h1>
          <p className="mt-2 text-sm text-ink-muted">Your confirmation email and WhatsApp message are sent after payment is confirmed.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" value={form.email} onChange={(value) => update("email", value)} type="email" required />
              <Field label="Phone / WhatsApp" value={form.phone} onChange={(value) => update("phone", value)} required />
            </div>
            <Field label="Full name" value={form.full_name} onChange={(value) => update("full_name", value)} required />
            <Field label="Address" value={form.address} onChange={(value) => update("address", value)} required />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City" value={form.city} onChange={(value) => update("city", value)} required />
              <Field label="State" value={form.state} onChange={(value) => update("state", value)} required />
              <Field label="Country" value={form.country} onChange={(value) => update("country", value)} required />
            </div>
            <Field label="Promo code" value={form.promo_code} onChange={(value) => update("promo_code", value)} />
            <div className="flex gap-2">
              {(["crypto", "paystack"] as const).map((value) => (
                <button type="button" key={value} onClick={() => setMethod(value)} className={`rounded-xl border px-4 py-2 text-sm capitalize ${method === value ? "border-violet-400 bg-violet-500/15" : "border-base-border"}`}>
                  {value}
                </button>
              ))}
            </div>
            <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-gradient py-3.5 font-semibold text-white disabled:opacity-50">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Starting checkout..." : `Pay ${currency} ${total.toLocaleString()}`}
            </button>
            {message && <p role="alert" className="text-sm text-ink-muted">{message}</p>}
          </form>
        </section>
        <aside className="h-fit rounded-2xl border border-base-border bg-base-surface p-6 lg:sticky lg:top-8">
          <div className="mb-5 flex items-center gap-2"><ShoppingBag className="h-5 w-5" /><h2 className="font-semibold">Order summary</h2></div>
          {items.length ? <div className="space-y-4">{items.map((item) => <div key={item.product_id} className="flex justify-between gap-4 text-sm"><span>{item.name} x {item.quantity}</span><span>{item.currency} {(item.price * item.quantity).toLocaleString()}</span></div>)}<div className="border-t border-base-border pt-4"><div className="flex justify-between text-sm text-ink-muted"><span>Delivery</span><span>{deliveryFee ? `${currency} ${deliveryFee.toLocaleString()}` : "Free"}</span></div><div className="mt-2 flex justify-between font-semibold"><span>Total</span><span>{currency} {total.toLocaleString()}</span></div></div></div> : <p className="text-sm text-ink-muted">Your cart is empty.</p>}
        </aside>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-ink-secondary">{label}</span><input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-base-border bg-base-surface2 px-4 py-3 text-sm outline-none focus:border-violet-500" /></label>;
}
