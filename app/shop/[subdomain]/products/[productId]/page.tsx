"use client";

import * as React from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const API = "/backend";

function currencyLabel(value: unknown, fallback = "NGN"): string {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const currency = value as { symbol?: unknown; id?: unknown; name?: unknown };
    for (const candidate of [currency.symbol, currency.id, currency.name]) {
      if (typeof candidate === "string" && candidate.trim()) return candidate;
    }
  }
  return fallback;
}

type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  category: string;
  stock: number;
  is_active: boolean;
  images: Array<{ url: string; publicId?: string }>;
  compareAt?: number;
  rating?: number;
  reviews?: number;
  badge?: string;
};

type Shop = {
  id: string;
  business_name: string;
  subdomain: string;
  description?: string;
  bio?: string;
  phone?: string;
  email?: string;
  address?: string;
  theme_config?: Record<string, string> | null;
  products?: Product[];
};

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("authToken") || localStorage.getItem("token") || ""
    : "";
}

function normalizeProduct(product: any): Product {
  return {
    id: product.id ?? product.uniqueId ?? "",
    name: product.name ?? "",
    price: Number(product.price ?? 0),
    currency: currencyLabel(product.currency),
    description: product.description ?? "",
    category: product.category ?? "",
    stock: Number(product.stock ?? 0),
    is_active: Boolean(product.is_active ?? product.isActive ?? false),
    images: Array.isArray(product.images) ? product.images : [],
    compareAt:
      Number(product.compareAt ?? product.compare_at ?? product.originalPrice ?? 0) ||
      undefined,
    rating: Number(product.rating ?? 0),
    reviews: Number(product.reviews ?? 0),
    badge: product.badge ?? undefined,
  };
}

export default function ProductDetailPage() {
  const params = useParams<{ subdomain: string; productId: string }>();
  const router = useRouter();
  const [shop, setShop] = React.useState<Shop | null>(null);
  const [product, setProduct] = React.useState<Product | null>(null);
  const [activeImage, setActiveImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [adding, setAdding] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!params.subdomain || !params.productId) return;
    async function load() {
      try {
        const response = await fetch(
          `${API}/storefront/${params.subdomain}/products/${params.productId}`
        );
        const json = await response.json().catch(() => null);
        const data = json?.data as
          | { shop?: Shop; product?: unknown }
          | undefined;
        setShop(data?.shop ? { ...data.shop, products: [] } : null);
        setProduct(data?.product ? normalizeProduct(data.product) : null);
      } catch {
        setShop(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.productId, params.subdomain]);

  const addToCart = async () => {
    if (!product || product.stock < 1) return;
    setAdding(true);
    setMessage(null);
    const token = getToken();
    try {
      if (token) {
        const response = await fetch(`${API}/user/cart/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: product.id, quantity }),
        });
        if (!response.ok) throw new Error("Unable to add product to cart");
      } else {
        const current = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        const existing = current.find((item: any) => item.product_id === product.id);
        if (existing) existing.quantity += quantity;
        else {
          current.push({
            id: product.id,
            product_id: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            quantity,
            image: product.images[0]?.url || null,
            stock: product.stock,
            is_active: product.is_active,
            shop_id: shop?.id || "",
          });
        }
        localStorage.setItem("guest_cart", JSON.stringify(current));
      }
      setMessage("Added to cart");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add product to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0e0e10] text-white/50"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!shop || !product) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0e0e10] px-6 text-center text-white"><p>Product not found.</p><button className="text-sm text-white/60 underline" onClick={() => router.back()}>Go back</button></div>;
  }

  const primary = shop.theme_config?.primaryColor || "#6c5dd3";
  const accent = shop.theme_config?.accentColor || "#f59e0b";
  const images = product.images.length > 0 ? product.images : [{ url: "" }];
  const currentImage = images[activeImage]?.url;
  const previousImage = () => setActiveImage((index) => (index - 1 + images.length) % images.length);
  const nextImage = () => setActiveImage((index) => (index + 1) % images.length);

  return (
    <main className="min-h-screen bg-[#0e0e10] px-4 py-6 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <button onClick={() => router.push(`/shop/${params.subdomain}`)} className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to {shop.business_name}</button>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <section>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04]">
              {currentImage ? <img src={currentImage} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-white/20"><ShoppingBag className="h-20 w-20" /></div>}
              {images.length > 1 && <><button aria-label="Previous image" onClick={previousImage} className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45"><ChevronLeft className="h-5 w-5" /></button><button aria-label="Next image" onClick={nextImage} className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45"><ChevronRight className="h-5 w-5" /></button></>}
            </div>
            {images.length > 1 && <div className="mt-3 grid grid-cols-5 gap-3">{images.map((image, index) => <button key={`${image.url}-${index}`} onClick={() => setActiveImage(index)} className={`aspect-square overflow-hidden rounded-xl border ${activeImage === index ? "border-white" : "border-white/[0.08]"}`}><img src={image.url} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-cover" /></button>)}</div>}
          </section>

          <section className="pt-2 lg:pt-8">
            {product.badge && <span className="mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: `${accent}22`, color: accent }}>{product.badge}</span>}
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: accent }}>{product.category || "Featured product"}</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{product.name}</h1>
            <div className="mt-6 flex items-baseline gap-3"><span className="text-2xl font-semibold" style={{ color: primary }}>{product.currency} {product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>{product.compareAt && <span className="text-sm text-white/35 line-through">{product.currency} {product.compareAt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>}</div>
            <p className="mt-6 whitespace-pre-line text-base leading-8 text-white/60">{product.description || "A carefully selected product from this shop."}</p>
            <div className="mt-8 flex items-center justify-between border-y border-white/[0.08] py-4 text-sm"><span className="text-white/45">Availability</span><span className={product.stock > 0 ? "text-emerald-300" : "text-red-300"}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span></div>
            <div className="mt-6 flex gap-3"><div className="flex items-center rounded-xl border border-white/[0.1] bg-white/[0.04]"><button aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-3 text-white/60"><Minus className="h-4 w-4" /></button><span className="w-8 text-center text-sm">{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))} className="p-3 text-white/60"><Plus className="h-4 w-4" /></button></div><button disabled={adding || product.stock < 1} onClick={addToCart} className="flex-1 rounded-xl px-5 py-3 font-semibold text-white disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>{adding ? "Adding..." : "Add to cart"}</button></div>
            {message && <p className="mt-3 text-sm text-white/60">{message}</p>}
            {(shop.bio || shop.description || shop.phone || shop.email || shop.address) && <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"><p className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>About {shop.business_name}</p><p className="mt-2 text-sm leading-7 text-white/55">{shop.bio || shop.description}</p><div className="mt-4 space-y-1 text-xs text-white/45">{shop.phone && <p>{shop.phone}</p>}{shop.email && <p>{shop.email}</p>}{shop.address && <p>{shop.address}</p>}</div></div>}
          </section>
        </div>
      </div>
    </main>
  );
}
