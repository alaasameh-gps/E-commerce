"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Minus, Plus, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import { useState } from "react";

import { Navbar } from "@/components/layout/navbar";
import { useCart } from "@/components/providers/cart-provider";
import { mockProducts } from "@/lib/mock-data";
import { calculateDiscount, formatCurrency } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem, buyNow } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = mockProducts.find((item) => item.slug === params.id || item._id === params.id) ?? mockProducts[0];
  const discount = calculateDiscount(product.price, product.compareAtPrice);

  const handleAddToCart = () => {
    addItem(
      {
        productId: String(product._id ?? product.slug),
        name: product.name,
        image: product.images[0],
        price: product.price,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    buyNow(
      {
        productId: String(product._id ?? product.slug),
        name: product.name,
        image: product.images[0],
        price: product.price,
      },
      quantity
    );
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-950">الرئيسية</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-neutral-950">المنتجات</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white p-4 shadow-sm">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={1200}
                height={1000}
                className="h-[420px] w-full rounded-[1.25rem] object-cover md:h-[560px]"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.slice(0, 3).map((image, index) => (
                <div key={`${image}-${index}`} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
                  <Image src={image} alt={`${product.name} ${index + 1}`} width={500} height={400} className="h-28 w-full rounded-xl object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span>{product.brand}</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" />
              <span className="flex items-center gap-1 text-amber-500">
                <Star size={14} fill="currentColor" /> {product.rating.toFixed(1)}
              </span>
              <span>({product.numReviews} تقييم)</span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950">{product.name}</h1>

            <div className="mt-5 flex items-end gap-3">
              <span className="text-3xl font-semibold text-neutral-950">{formatCurrency(product.price)}</span>
              {product.compareAtPrice ? (
                <>
                  <span className="text-lg text-neutral-400 line-through">{formatCurrency(product.compareAtPrice)}</span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">-{discount}%</span>
                </>
              ) : null}
            </div>

            <p className="mt-5 text-neutral-600">{product.description}</p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-neutral-700">
                <ShieldCheck size={16} className="text-emerald-600" />
                {product.stock > 0 ? `${product.stock} متوفر في المخزون` : "غير متوفر"}
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-700">
                <Truck size={16} className="text-emerald-600" />
                شحن سريع مجاني فوق 75 ريال
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
              <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800">
                <Minus size={16} />
              </button>
              <span className="min-w-10 text-center text-lg font-medium">{quantity}</span>
              <button type="button" onClick={() => setQuantity((current) => current + 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800">
                <Plus size={16} />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={handleAddToCart} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: "var(--brand-accent, #171717)" }}>
                <ShoppingCart size={16} /> أضف إلى السلة
              </button>
              <button type="button" onClick={handleBuyNow} className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-3.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50">
                اشتري الآن
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
