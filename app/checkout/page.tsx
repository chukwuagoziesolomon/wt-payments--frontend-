"use client";

import React, { useEffect, useState } from "react";
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
};

type PaymentData = {
  payment_intent_id: string;
  transaction_id?: string;
  expiration_time: string;
  fee_in_crypto: number;
  wallet: { address: string; qr_code: string };
  fiat: { amount: number; currency: string };
  crypto: { name: string; symbol: string; network: string; amount: number };
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

export default function GuestCheckoutPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
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

  useEffect(() => {
    setCart(getGuestCart());
  }, []);

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

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const startCheckout = async () => {
    if (!guestName || !guestEmail) {
      notify("Please fill in your name and email");
      return;
    }
    setSubmitting(true);
    try {
      const shopId = cart[0]?.shop_id || "";
      const res = await fetch("/backend/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_email: guestEmail,
          items: cart.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            shopId: shopId,
          })),
          fiat_currency: cart[0]?.currency || "NGN",
          payment_method: "crypto",
        }),
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
            amount: checkoutResult.fiat_amount || 0,
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
    router.push("/checkout/success");
  };

  if (cart.length === 0) {
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
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-[#19191d] border-border sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-white">
                    Guest Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-white font-bold">
                        {cart[0]?.currency} {cartTotal.toLocaleString()}
                      </span>
                    </div>
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
                  </div>
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
                      {cart[0]?.currency} {cartTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-lg font-bold text-[#9d8df1]">
                        {cart[0]?.currency} {cartTotal.toLocaleString()}
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
