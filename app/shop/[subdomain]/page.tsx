"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink, ShoppingBag, Package, Globe, Loader2, Plus, X, Minus } from "lucide-react";

const API = "/backend";

function getToken() {
  return typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : "";
}

type ShopData = {
  id: string;
  business_name: string;
  subdomain: string;
  shop_url: string;
  storefront_url?: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  theme_config: Record<string, any> | null;
  status: "draft" | "published";
  currency: string;
  products: Product[];
  payment_gateway?: {
    enabled: boolean;
    checkout_url: string | null;
  };
};

type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  category: string;
  stock: number;
  is_active: boolean;
  images: Array<{ url: string; publicId: string }>;
};

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
};

export default function StorefrontPage() {
  const params = useParams<{ subdomain: string }>();
  const subdomain = params?.subdomain ?? "";
  const router = useRouter();

  const [shop, setShop] = React.useState<ShopData | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [addingId, setAddingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!subdomain) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API}/storefront/${subdomain}`);
        const json = await res.json().catch(() => null);

        if (!res.ok || !json?.data) {
          if (!cancelled) setError(json?.message || "Shop not found");
          return;
        }

        if (!cancelled) setShop(json.data);

        if (!cancelled) setProducts(Array.isArray(json.data.products) ? json.data.products : []);
      } catch {
        if (!cancelled) setError("Failed to load storefront");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [subdomain]);

  const loadCart = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}/user/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.result?.items) {
        setCartItems(json.result.items);
      }
    } catch {
      // silently fail - cart is optional
    }
  };

  React.useEffect(() => {
    loadCart();
  }, []);

  const addToCart = async (product: Product) => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setAddingId(product.id);
    try {
      const res = await fetch(`${API}/user/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        loadCart();
      } else {
        alert(json.data || json.message || "Failed to add to cart");
      }
    } catch {
      alert("Error adding to cart");
    } finally {
      setAddingId(null);
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    const token = getToken();
    if (!token || quantity < 1) return;
    try {
      const res = await fetch(`${API}/user/cart/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) loadCart();
    } catch {
      // ignore
    }
  };

  const removeCartItem = async (itemId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}/user/cart/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) loadCart();
    } catch {
      // ignore
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const primary = shop?.theme_config?.primaryColor || "#6c5dd3";
  const accent = shop?.theme_config?.accentColor || "#f59e0b";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0e10]">
        <div className="flex flex-col items-center gap-4 text-white/50">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: primary }} />
          <p className="text-sm">Loading storefront…</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0e10] px-4">
        <div className="text-center">
          <Globe className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Shop not found</h1>
          <p className="text-white/40 text-sm">{error || "This storefront does not exist or has been removed."}</p>
        </div>
      </div>
    );
  }

  const checkoutUrl = shop.payment_gateway?.checkout_url;

  return (
    <div className="min-h-screen bg-[#0e0e10]" style={{ "--primary": primary, "--accent": accent } as React.CSSProperties}>
      {/* Banner */}
      <div
        className="w-full h-48 sm:h-64 relative overflow-hidden"
        style={{ background: shop.banner_url ? undefined : `linear-gradient(135deg, ${primary}40, ${accent}25)` }}
      >
        {shop.banner_url && (
          <img src={shop.banner_url} alt="Shop banner" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Shop header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 mb-8 relative z-10">
          <div className="flex items-end gap-4">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-[#0e0e10] flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: shop.logo_url ? undefined : `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              {shop.logo_url
                ? <img src={shop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                : <span className="text-3xl font-black text-white">{(shop.business_name || "S").charAt(0)}</span>
              }
            </div>
            <div className="pb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{shop.business_name}</h1>
              {shop.description && (
                <p className="text-white/50 text-sm mt-1 max-w-lg">{shop.description}</p>
              )}
            </div>
          </div>

          {checkoutUrl && (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              <ShoppingBag className="w-4 h-4" />
              Buy Now
            </a>
          )}

          {/* Cart Icon */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white border border-white/10 hover:border-white/25 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#9d8df1] text-white text-xs font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Products */}
        <div className="pb-16">
          <h2 className="text-lg font-semibold text-white mb-5">Products</h2>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] p-12 text-center bg-[#19191d]">
              <Package className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No products listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#19191d] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/[0.15] transition-colors group"
                >
                  <div className="h-44 bg-[#111118] overflow-hidden relative">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-white/15" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                    {product.category && (
                      <p className="text-white/35 text-xs mb-3">{product.category}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold" style={{ color: primary }}>
                        {product.currency} {product.price.toLocaleString()}
                      </p>
                      {product.stock > 0 ? (
                        <span className="text-xs text-emerald-400">In stock</span>
                      ) : (
                        <span className="text-xs text-red-400">Out of stock</span>
                      )}
                    </div>
                     {checkoutUrl && (
                       <a
                         href={checkoutUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                         style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                       >
                         <ShoppingBag className="w-3.5 h-3.5" />
                         Buy Now
                       </a>
                     )}

                     {product.is_active && product.stock > 0 && (
                       <button
                         onClick={() => addToCart(product)}
                         disabled={addingId === product.id}
                         className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white border border-white/10 hover:border-white/25 transition-all disabled:opacity-50"
                       >
                         {addingId === product.id ? (
                           <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...</>
                         ) : (
                           <><Plus className="w-3.5 h-3.5" /> Add to Cart</>
                         )}
                       </button>
                     )}
                   </div>
                 </div>
               ))}
             </div>
            )}
          </div>
        </div>

        {/* Cart Drawer */}
        {cartOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#111119] border-l border-white/[0.08] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/[0.06]">
                <h3 className="text-lg font-semibold text-white">Shopping Cart ({cartCount})</h3>
                <button onClick={() => setCartOpen(false)} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-[#19191d] border border-white/[0.06]">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#11111a] flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-white/15" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.currency} {item.price.toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateCartItem(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-white disabled:opacity-50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartItem(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-white disabled:opacity-50"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeCartItem(item.id)}
                              className="ml-auto w-7 h-7 rounded-md border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/10"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-4 sm:p-6 border-t border-white/[0.06] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Total</span>
                    <span className="text-lg font-bold text-[#9d8df1]">{shop?.currency} {cartTotal.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      router.push("/cart");
                    }}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#9d8df1] to-[#5b4dd4] hover:shadow-lg transition-all"
                  >
                    View Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-white/[0.05] py-6 text-center">
          <p className="text-xs text-white/20">
            Powered by <span className="text-white/40 font-medium">Zedify</span>
          </p>
        </div>
    </div>
  );
}
