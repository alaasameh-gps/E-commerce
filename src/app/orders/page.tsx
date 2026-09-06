"use client";

import Link from "next/link";
import { useState } from "react";

import { Navbar } from "@/components/layout/navbar";
import { formatCurrency } from "@/lib/utils";

type OrderRecord = {
  id: string;
  createdAt: string;
  status: string;
  total: number;
};

export default function OrdersPage() {
  const [orders] = useState<OrderRecord[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      return JSON.parse(window.localStorage.getItem("morrow-orders") ?? "[]") as OrderRecord[];
    } catch {
      return [];
    }
  });

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">طلباتي</h1>

        {orders.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-dashed border-neutral-300 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-medium text-neutral-900">لا توجد طلبات حتى الآن.</p>
            <Link href="/products" className="mt-4 inline-flex rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800">
              ابدأ التسوق الآن
            </Link>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-4 border-b border-neutral-200 px-3 py-4 text-sm font-medium text-neutral-600 sm:px-5">
              <span>الطلب</span>
              <span>التاريخ</span>
              <span>الإجمالي</span>
              <span>الحالة</span>
            </div>

            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-4 border-b border-neutral-200 px-3 py-4 text-sm last:border-0 sm:px-5">
                <Link href={`/orders/${order.id}`} className="font-medium text-neutral-900 hover:text-neutral-600">
                  {order.id}
                </Link>
                <span className="text-neutral-600">{new Date(order.createdAt).toLocaleDateString("ar-EG")}</span>
                <span className="text-neutral-900">{formatCurrency(order.total)}</span>
                <span className="inline-flex w-fit rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">{order.status}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
