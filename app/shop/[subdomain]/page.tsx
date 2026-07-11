"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { ExternalLink, ShoppingBag, Package, Globe, Loader2 } from "lucide-react";

const API = "/backend";

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

export default function StorefrontPage() {
  const params = useParams<{ subdomain: string }>();
  const subdomain = params?.subdomain ?? "";

  const [shop, setShop] = React.useState<ShopData | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.05] py-6 text-center">
        <p className="text-xs text-white/20">
          Powered by <span className="text-white/40 font-medium">Zedify</span>
        </p>
      </div>
    </div>
  );
}
