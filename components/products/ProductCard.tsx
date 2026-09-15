"use client";

import { useState } from "react";

type Product = {
  name: string;
  category: string;
  price: number;
  currency?: string;
  image?: string;
  description?: string;
  compareAt?: number;
  rating: number;
  reviews: number;
  badge?: string;
};

type ProductCardProps = {
  product: Product;
  onAddToCart?: () => void;
  onViewProduct?: () => void;
  primaryColor?: string;
};

export function ProductCard({
  product,
  onAddToCart,
  onViewProduct,
  primaryColor = "#6c5dd3",
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [inCart, setInCart] = useState(false);

  const handleAddToCart = () => {
    setInCart(true);
    onAddToCart?.();
  };

  return (
    <div
      className="group relative w-full max-w-[280px] cursor-pointer rounded-2xl border border-base-border bg-base-surface overflow-hidden transition hover:border-violet-500/40"
      onClick={onViewProduct}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onViewProduct?.();
      }}
      role={onViewProduct ? "link" : undefined}
      tabIndex={onViewProduct ? 0 : undefined}
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-violet-700/25 via-base-surface2 to-base-surface2 overflow-hidden">
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 text-[10px] font-medium uppercase tracking-wide text-violet-300 bg-violet-500/15 border border-violet-500/25 rounded-full px-2.5 py-1">
            {product.badge}
          </span>
        )}

        <button
          onClick={(event) => {
            event.stopPropagation();
            setWishlisted((v) => !v);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-base-bg/70 backdrop-blur flex items-center justify-center border border-base-border hover:border-violet-400/50 transition"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={wishlisted ? "#A78BFA" : "none"}
            stroke={wishlisted ? "#A78BFA" : "#9793AC"}
            strokeWidth="2"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-violet-gradient opacity-80 rotate-12 group-hover:rotate-6 transition-transform duration-300" />
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wide text-ink-muted mb-1">
          {product.category}
        </p>
        <h3 className="text-sm font-medium text-ink-primary mb-1.5 leading-snug">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          <StarRow rating={product.rating} />
          <span className="text-xs text-ink-muted">({product.reviews})</span>
        </div>

        {product.description && (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-ink-muted">
            {product.description}
          </p>
        )}

        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-mono tabular text-lg font-semibold text-ink-primary">
            {product.currency || "USD"} {product.price.toFixed(2)}
          </span>
          {product.compareAt && (
            <span className="font-mono tabular text-xs text-ink-muted line-through">
              {product.currency || "USD"} {product.compareAt.toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            handleAddToCart();
          }}
          disabled={inCart}
          className="w-full rounded-xl text-sm font-medium py-2.5 transition active:scale-[0.98] disabled:cursor-default"
          style={
            inCart
              ? { backgroundColor: "color-mix(in srgb, #34d399 10%, transparent)", color: "#34d399", border: "1px solid color-mix(in srgb, #34d399 25%, transparent)" }
              : { backgroundColor: primaryColor, color: "#fff" }
          }
        >
          {inCart ? "Added to cart" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill={i < Math.round(rating) ? "#A78BFA" : "#242138"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
        </svg>
      ))}
    </div>
  );
}
