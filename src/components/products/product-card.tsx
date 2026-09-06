"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { calculateDiscount, formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

const FAVORITES_KEY = "morrow-favorites";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discount = calculateDiscount(product.price, product.compareAtPrice);
  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const saved = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]") as string[];
      return saved.includes(String(product._id ?? product.slug));
    } catch {
      return false;
    }
  });

  const handleAddToCart = () => {
    addItem({
      productId: String(product._id ?? product.slug),
      name: product.name,
      image: product.images[0],
      price: product.price,
    });
  };

  const handleToggleFavorite = () => {
    const id = String(product._id ?? product.slug);
    const saved = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]") as string[];
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    setIsFavorite(next.includes(id));
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            width={800}
            height={920}
            className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        <button
          type="button"
          aria-label={isFavorite ? `إزالة ${product.name} من المفضلة` : `إضافة ${product.name} إلى المفضلة`}
          onClick={handleToggleFavorite}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition ${
            isFavorite ? "bg-neutral-950 text-white" : "bg-white/90 text-neutral-700 hover:bg-white"
          }`}
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
          <span>{product.brand}</span>
          <span className="flex items-center gap-1 text-amber-500">
            <Star size={12} fill="currentColor" /> {product.rating.toFixed(1)}
          </span>
        </div>

        <Link href={`/products/${product.slug}`} className="block text-lg font-medium text-neutral-900 transition hover:text-neutral-600">
          {product.name}
        </Link>

        <div className="flex items-end gap-2">
          <span className="text-xl font-semibold text-neutral-950">{formatCurrency(product.price)}</span>
          {product.compareAtPrice ? (
            <>
              <span className="text-sm text-neutral-400 line-through">{formatCurrency(product.compareAtPrice)}</span>
              {discount > 0 ? <span className="text-xs font-medium text-emerald-600">-{discount}%</span> : null}
            </>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          style={{ backgroundColor: "var(--brand-accent, #171717)" }}
        >
          <ShoppingCart size={16} /> أضف إلى السلة
        </button>
      </div>
    </article>
  );
}
