"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/components/ui/ToastProvider";

const API = "/backend";

function getToken() {
  return typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : "";
}

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

type CartData = {
  cart_id: string;
  items: CartItem[];
  total: number;
  currency: string;
  item_count: number;
};

export default function CartPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/user/cart`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.result) {
        setCart(json.result);
      } else {
        notify(json.data || json.message || "Failed to load cart");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error loading cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const res = await authFetch(`${API}/user/cart/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ quantity }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        loadCart();
      } else {
        notify(json.data || json.message || "Failed to update quantity");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error updating quantity");
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await authFetch(`${API}/user/cart/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        notify("Item removed");
        loadCart();
      } else {
        notify("Failed to remove item");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error removing item");
    }
  };

  const clearCart = async () => {
    if (!confirm("Clear all items from cart?")) return;
    try {
      const res = await authFetch(`${API}/user/cart`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        notify("Cart cleared");
        loadCart();
      } else {
        notify("Failed to clear cart");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error clearing cart");
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    setCheckingOut(true);
    try {
      const res = await authFetch(`${API}/user/cart/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          fiat_currency: cart.currency || "NGN",
          payment_method: "crypto",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.result) {
        router.push(`/transactions/create?reference_id=${json.result.reference_id}`);
      } else {
        notify(json.data || json.message || "Failed to start checkout");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error starting checkout");
    } finally {
      setCheckingOut(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
          </div>
          <Card className="bg-[#19191d] border-border">
            <CardContent className="py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button onClick={() => router.push("/dashboard/shop")} className="bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white">
                Browse Shops
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
            <span className="text-sm text-muted-foreground">({cart.item_count} items)</span>
          </div>
          <Button variant="ghost" onClick={clearCart} className="text-red-400 hover:text-red-300 text-sm">
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id} className="bg-[#19191d] border-border">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#11111a] flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-2">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Stock: {item.stock}</p>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-white hover:border-[#9d8df1] transition-colors disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-white hover:border-[#9d8df1] transition-colors disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#9d8df1]">
                              {formatCurrency(item.price * item.quantity, item.currency)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(item.price, item.currency)} each
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-8 h-8 rounded-lg border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-[#19191d] border-border sticky top-4">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({cart.item_count} items)</span>
                    <span className="text-white">{formatCurrency(cart.total, cart.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">Total</span>
                    <span className="text-xl font-bold text-[#9d8df1]">
                      {formatCurrency(cart.total, cart.currency)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={checkingOut || cart.items.length === 0}
                  className="w-full bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] text-white font-semibold py-3 rounded-xl disabled:opacity-50"
                >
                  {checkingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Checkout <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <button
                  onClick={() => router.push("/dashboard/shop")}
                  className="w-full text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  Continue Shopping
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
