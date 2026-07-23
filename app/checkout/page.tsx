"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Loader2,
  Wallet,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

type CartItem = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  image: string | null;
  stock: number;
  is_active: boolean;
  shop_id: string;
};

type CheckoutAsset = {
  currency_id: string;
  name: string;
  symbol: string;
  logo?: string;
  network?: { name: string; logo?: string };
  amount: number;
};

type CheckoutResult = {
  payment_method: "crypto" | "paystack";
  reference_id: string;
  payment_intent_id: string;
  fiat_amount?: number;
  fiat_currency?: string;
  authorization_url?: string;
  assets?: CheckoutAsset[];
  items_total?: number;
  delivery_fee?: number;
  discount_amount?: number;
  delivery_address?: Record<string, any>;
  delivery_state?: string;
};

type PaymentData = {
  payment_intent_id: string;
  reference_id?: string;
  transaction_id?: string;
  expiration_time: string;
  fee_in_crypto: number;
  wallet: { address: string; qr_code: string };
  fiat: { amount: number; currency: string };
  crypto: { name: string; symbol: string; network: string; amount: number };
};

type DeliverySettings = {
  has_free_delivery?: boolean;
  delivery_fee?: number;
  delivery_zones?: Record<string, number>;
  discount_percentage?: number;
  discount_amount?: number;
  promo_code?: string;
  free_delivery_threshold?: number;
};

function getGuestCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem("guest_cart") || "[]");
  } catch {
    return [];
  }
}

function setGuestCart(items: CartItem[]) {
  localStorage.setItem("guest_cart", JSON.stringify(items));
}

function getToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("authToken") || localStorage.getItem("token") || ""
  );
}

export default function GuestCheckoutPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(
    null
  );
  const [selectedAsset, setSelectedAsset] = useState<CheckoutAsset | null>(
    null
  );
  const [assetDropdownOpen, setAssetDropdownOpen] = useState(false);
  const [step, setStep] = useState<"details" | "payment">("details");
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [waitingOpen, setWaitingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [delivery, setDelivery] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
  });
  const [deliveryState, setDeliveryState] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [deliverySettings, setDeliverySettings] =
    useState<DeliverySettings | null>(null);
  const [loadingDeliverySettings, setLoadingDeliverySettings] = useState(false);

  const cartItemsTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const deliveryFee = useMemo(() => {
    if (!deliverySettings) return 0;
    if (deliverySettings.has_free_delivery) return 0;
    if (
      deliverySettings.delivery_zones &&
      deliveryState &&
      deliverySettings.delivery_zones[deliveryState]
    ) {
      return deliverySettings.delivery_zones[deliveryState];
    }
    return deliverySettings.delivery_fee || 0;
  }, [deliverySettings, deliveryState]);

  const discountAmount = useMemo(() => {
    if (!deliverySettings) return 0;
    let discount = deliverySettings.discount_amount || 0;
    if (
      promoCode &&
      deliverySettings.promo_code &&
      promoCode === deliverySettings.promo_code
    ) {
      discount += deliverySettings.discount_amount || 0;
    }
    if (
      deliverySettings.discount_percentage &&
      deliverySettings.discount_percentage > 0
    ) {
      discount += (cartItemsTotal * deliverySettings.discount_percentage) / 100;
    }
    return discount;
  }, [deliverySettings, promoCode, cartItemsTotal]);

  const estimatedTotal = useMemo(
    () => Math.max(0, cartItemsTotal + deliveryFee - discountAmount),
    [cartItemsTotal, deliveryFee, discountAmount]
  );

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetch("/backend/user/cart", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
        .then((res) => res.json().catch(() => ({})))
        .then((json) => {
          if (json.result?.items) {
            setCart(json.result.items);
          } else {
            setCart(getGuestCart());
          }
        })
        .catch(() => {
          setCart(getGuestCart());
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setCart(getGuestCart());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const shopId =
      cart[0]?.shop_id ||
      new URLSearchParams(window.location.search).get("shopId");
    if (!shopId) return;
    setLoadingDeliverySettings(true);
    fetch(`/backend/shop/${shopId}/delivery-settings`, {
      cache: "no-store",
    })
      .then((res) => res.json().catch(() => ({})))
      .then((json) => {
        if (json.result) {
          setDeliverySettings(json.result);
          if (json.result.delivery_zones) {
            const firstState = Object.keys(json.result.delivery_zones)[0] || "";
            setDeliveryState(firstState);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingDeliverySettings(false);
      });
  }, [cart]);

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) => {
      const next = prev.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      );
      setGuestCart(next);
      return next;
    });
  };

  const removeItem = (productId: string) => {
    setCart((prev) => {
      const next = prev.filter((item) => item.product_id !== productId);
      setGuestCart(next);
      return next;
    });
  };

  const canProceed =
    guestName.trim() &&
    guestEmail.trim() &&
    delivery.full_name.trim() &&
    delivery.phone.trim() &&
    delivery.address.trim() &&
    delivery.city.trim() &&
    deliveryState;

  const startCheckout = async () => {
    if (!guestName || !guestEmail) {
      notify("Please fill in your name and email");
      return;
    }
    if (!canProceed) {
      notify("Please complete the delivery address");
      return;
    }
    setSubmitting(true);
    try {
      const shopId = cart[0]?.shop_id || "";
      const payload: Record<string, any> = {
        customer_email: guestEmail,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          shopId,
        })),
        fiat_currency: cart[0]?.currency || "NGN",
        payment_method: "crypto",
        delivery_address: delivery,
        delivery_state: deliveryState,
      };
      if (promoCode.trim()) {
        payload.promo_code = promoCode.trim();
      }
      const res = await fetch("/backend/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.result) {
        setCheckoutResult(json.result);
        if (json.result.assets && json.result.assets.length > 0) {
          setSelectedAsset(json.result.assets[0]);
        }
        setStep("payment");
      } else {
        notify(json.data || json.message || "Failed to start checkout");
      }
    } catch {
      notify("Error starting checkout");
    } finally {
      setSubmitting(false);
    }
  };

  const createWallet = async () => {
    if (!checkoutResult || !selectedAsset) return;
    setLoadingWallet(true);
    try {
      const res = await fetch("/backend/cart/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference_id: checkoutResult.reference_id,
          crypto_currency_id: selectedAsset.currency_id,
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json.data) {
        const d = json.data;
        const cryptoNetwork: string =
          typeof d.crypto?.network === "object"
            ? (d.crypto.network?.name ?? "")
            : (d.crypto?.network ?? "");
        setPaymentData({
          payment_intent_id: d.payment_intent_id,
          transaction_id: d.transaction_id,
          expiration_time: d.expiration_time,
          fee_in_crypto: d.fee_in_crypto,
          wallet: d.wallet,
          fiat: d.fiat ?? {
            amount: checkoutResult.fiat_amount || estimatedTotal,
            currency: cart[0]?.currency || "NGN",
          },
          crypto: {
            amount: d.crypto?.amount ?? selectedAsset.amount,
            network: cryptoNetwork,
            name: d.crypto?.name || selectedAsset.name,
            symbol: d.crypto?.symbol || selectedAsset.symbol,
          },
        });
        setWaitingOpen(true);
      } else {
        notify(json?.message || "Failed to get wallet address");
      }
    } catch {
      notify("Error generating wallet");
    } finally {
      setLoadingWallet(false);
    }
  };

  const handlePaymentComplete = () => {
    setWaitingOpen(false);
    localStorage.removeItem("guest_cart");
    const ref = checkoutResult?.reference_id || paymentData?.reference_id || "";
    router.push(`/checkout/success${ref ? `?reference_id=${ref}` : ""}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <Card className="bg-[#19191d] border-border max-w-md w-full">
          <CardContent className="py-16 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-white/20 mx-auto" />
            <h2 className="text-lg font-semibold text-white">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground text-sm">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white"
            >
              Browse Shops
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Guest Checkout</h1>

        {step === "details" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="bg-[#19191d] border-border">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#11111a] flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-white/20 m-auto" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-medium line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.currency} {item.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-white disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white text-sm w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-white disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="ml-auto"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-[#19191d] border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-white">
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Full Name
                      </label>
                      <input
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9d8df1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9d8df1]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Phone
                      </label>
                      <input
                        value={delivery.phone}
                        onChange={(e) =>
                          setDelivery({ ...delivery, phone: e.target.value })
                        }
                        className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9d8df1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Address
                      </label>
                      <input
                        value={delivery.address}
                        onChange={(e) =>
                          setDelivery({ ...delivery, address: e.target.value })
                        }
                        className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9d8df1]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        City
                      </label>
                      <input
                        value={delivery.city}
                        onChange={(e) =>
                          setDelivery({ ...delivery, city: e.target.value })
                        }
                        className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9d8df1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        State
                      </label>
                      {deliverySettings?.delivery_zones &&
                      Object.keys(deliverySettings.delivery_zones).length >
                        0 ? (
                        <select
                          value={deliveryState}
                          onChange={(e) => setDeliveryState(e.target.value)}
                          className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9d8df1]"
                        >
                          {Object.keys(deliverySettings.delivery_zones).map(
                            (state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <input
                          value={deliveryState}
                          onChange={(e) => setDeliveryState(e.target.value)}
                          className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9d8df1]"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Country
                      </label>
                      <input
                        value={delivery.country}
                        onChange={(e) =>
                          setDelivery({ ...delivery, country: e.target.value })
                        }
                        className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9d8df1]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-[#19191d] border-border sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-white">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Items ({cart.length})
                    </span>
                    <span className="text-white">
                      {cart[0]?.currency} {cartItemsTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-white">
                      {deliverySettings?.has_free_delivery
                        ? "Free"
                        : `${cart[0]?.currency} ${deliveryFee.toLocaleString()}`}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-emerald-400">
                        -{cart[0]?.currency} {discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-lg font-bold text-[#9d8df1]">
                        {cart[0]?.currency} {estimatedTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {deliverySettings?.promo_code && (
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Promo Code
                      </label>
                      <input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder={deliverySettings.promo_code}
                        className="w-full bg-[#11111a] border border-[#23242A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9d8df1]"
                      />
                    </div>
                  )}
                  <Button
                    onClick={startCheckout}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white font-semibold py-2.5 rounded-xl disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue to Payment{" "}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-[#19191d] border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-white">
                    Select Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[#9d8df1] bg-[#9d8df1]/10 text-[#c7bfff] text-sm font-medium"
                    >
                      <Wallet className="w-4 h-4" /> Crypto
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/70 text-sm font-medium"
                    >
                      <CreditCard className="w-4 h-4" /> Paystack
                    </button>
                  </div>

                  {checkoutResult &&
                    checkoutResult.assets &&
                    checkoutResult.assets.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Select Asset
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setAssetDropdownOpen((o) => !o)}
                            className="w-full rounded-md border border-border bg-[#19191d] px-4 py-3 flex items-center justify-between text-sm text-white"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {selectedAsset?.symbol}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                ≈ {selectedAsset?.amount?.toLocaleString()}{" "}
                                {selectedAsset?.symbol}
                              </span>
                            </div>
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                          </button>
                          {assetDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 rounded-md border border-border bg-[#19191d] shadow-lg">
                              {checkoutResult.assets.map((a) => (
                                <button
                                  key={a.currency_id}
                                  type="button"
                                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#23243a] transition-colors text-left"
                                  onClick={() => {
                                    setSelectedAsset(a);
                                    setAssetDropdownOpen(false);
                                  }}
                                >
                                  <span className="text-white font-medium">
                                    {a.name || a.symbol}
                                  </span>
                                  <span className="text-muted-foreground text-xs ml-auto">
                                    {a.amount.toLocaleString()} {a.symbol}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={createWallet}
                          disabled={!selectedAsset || loadingWallet}
                          className="w-full bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white font-semibold py-2.5 rounded-xl disabled:opacity-50"
                        >
                          {loadingWallet ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />{" "}
                              Generating wallet...
                            </>
                          ) : (
                            <>Pay with {selectedAsset?.symbol || "crypto"}</>
                          )}
                        </Button>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-[#19191d] border-border sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-white">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Items ({cart.length})
                    </span>
                    <span className="text-white">
                      {cart[0]?.currency}{" "}
                      {checkoutResult?.items_total?.toLocaleString() ??
                        cartItemsTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-white">
                      {deliverySettings?.has_free_delivery
                        ? "Free"
                        : `${cart[0]?.currency} ${checkoutResult?.delivery_fee?.toLocaleString() ?? deliveryFee.toLocaleString()}`}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-emerald-400">
                        -{cart[0]?.currency}{" "}
                        {checkoutResult?.discount_amount?.toLocaleString() ??
                          discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-lg font-bold text-[#9d8df1]">
                        {cart[0]?.currency}{" "}
                        {checkoutResult?.fiat_amount?.toLocaleString() ??
                          estimatedTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setStep("details")}
                    variant="ghost"
                    className="w-full text-muted-foreground text-sm"
                  >
                    Back to Details
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {waitingOpen && paymentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#17171a] border border-[#2a2a3a] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-white text-base font-semibold">
                Complete Payment
              </span>
              <span className="text-sm text-muted-foreground">Waiting...</span>
            </div>
            <div className="bg-white rounded-xl p-3 w-44 h-44 mx-auto flex items-center justify-center">
              {paymentData.wallet.qr_code ? (
                <img
                  src={paymentData.wallet.qr_code}
                  alt="QR"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-400 text-xs">QR unavailable</span>
              )}
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Send exactly</p>
              <p className="text-white text-2xl font-bold">
                {paymentData.crypto.amount} {paymentData.crypto.symbol}
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                {paymentData.crypto.network}
              </p>
            </div>
            <div className="bg-[#19191d] border border-border rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="text-white text-xs font-mono flex-1 truncate">
                {paymentData.wallet.address}
              </span>
            </div>
            <Button
              onClick={handlePaymentComplete}
              className="w-full bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white"
            >
              I&apos;ve Sent Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
