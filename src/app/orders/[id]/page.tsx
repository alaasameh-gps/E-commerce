"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Navbar } from "@/components/layout/navbar";
import { formatCurrency } from "@/lib/utils";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type OrderRecord = {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    email: string;
    phone?: string;
    address: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
  coupon?: string | null;
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order] = useState<OrderRecord | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const saved = JSON.parse(window.localStorage.getItem("morrow-orders") ?? "[]") as OrderRecord[];
      return saved.find((entry) => entry.id === params.id) ?? null;
    } catch {
      return null;
    }
  });

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-lg text-neutral-600">لم يتم العثور على الطلب.</p>
          <Link href="/orders" className="mt-4 inline-flex rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900">
            العودة إلى الطلبات
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">تفاصيل الطلب</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">{order.id}</h1>
          </div>
          <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700">{order.status}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-950">العناصر</h2>
            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.name}`} className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div>
                    <p className="font-medium text-neutral-900">{item.name}</p>
                    <p className="text-sm text-neutral-500">الكمية: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-neutral-950">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-950">معلومات الشحن</h2>
            <div className="mt-5 space-y-3 text-sm text-neutral-600">
              <p><span className="font-medium text-neutral-900">الاسم:</span> {order.shippingAddress.fullName}</p>
              <p><span className="font-medium text-neutral-900">البريد:</span> {order.shippingAddress.email}</p>
              <p><span className="font-medium text-neutral-900">العنوان:</span> {order.shippingAddress.address}</p>
              {order.shippingAddress.phone ? <p><span className="font-medium text-neutral-900">الهاتف:</span> {order.shippingAddress.phone}</p> : null}
              {order.coupon ? <p><span className="font-medium text-neutral-900">رمز الخصم:</span> {order.coupon}</p> : null}
            </div>

            <div className="mt-6 border-t border-neutral-200 pt-4 text-sm text-neutral-600">
              <div className="flex items-center justify-between">
                <span>المجموع</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>الشحن</span>
                <span>{order.shipping === 0 ? "مجاني" : formatCurrency(order.shipping)}</span>
              </div>
              {order.discount > 0 ? (
                <div className="mt-2 flex items-center justify-between text-emerald-600">
                  <span>الخصم</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              ) : null}
              <div className="mt-3 flex items-center justify-between text-base font-semibold text-neutral-950">
                <span>الإجمالي</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            <Link href="/orders" className="mt-6 inline-flex rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50">
              العودة إلى الطلبات
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
