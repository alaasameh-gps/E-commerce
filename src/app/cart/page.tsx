"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { useCart } from "@/components/providers/cart-provider";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const shipping = subtotal > 150 ? 0 : 12;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">عربة التسوق</h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-dashed border-neutral-300 bg-white p-8 text-center shadow-sm sm:p-12">
            <p className="text-xl font-medium text-neutral-900">سلة التسوق فارغة.</p>
            <Link href="/products" className="mt-4 inline-flex rounded-full px-5 py-3 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: "var(--brand-accent, #171717)" }}>
              متابعة التسوق
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex flex-col gap-4 rounded-[1.75rem] border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                  <Image src={item.image} alt={item.name} width={180} height={180} className="h-28 w-full rounded-2xl object-cover sm:w-28" />
                  <div className="flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-medium text-neutral-900">{item.name}</h2>
                        <p className="text-sm text-neutral-500">{formatCurrency(item.price)}</p>
                      </div>
                      <button type="button" onClick={() => removeItem(item.productId)} className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700">
                        <Trash2 size={15} /> إزالة
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-2 py-1.5">
                        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100">
                          <Minus size={14} />
                        </button>
                        <span className="min-w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100">
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-lg font-semibold text-neutral-950">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-950">ملخص الطلب</h2>
              <div className="mt-6 space-y-4 text-sm text-neutral-600">
                <div className="flex items-center justify-between">
                  <span>المجموع الفرعي</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>الشحن</span>
                  <span>{shipping === 0 ? "مجاني" : formatCurrency(shipping)}</span>
                </div>
                <div className="my-4 h-px bg-neutral-200" />
                <div className="flex items-center justify-between text-base font-semibold text-neutral-950">
                  <span>الإجمالي</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: "var(--brand-accent, #171717)" }}>
                متابعة إلى الدفع
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
