"use client";

import { useEffect, useState } from "react";

import { Navbar } from "@/components/layout/navbar";
import { formatCurrency } from "@/lib/utils";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

type AdminOrder = {
  _id: string;
  createdAt: string;
  total: number;
  orderStatus: OrderStatus;
  paymentStatus: "pending" | "paid" | "failed";
  shippingAddress?: {
    fullName?: string;
    email?: string;
    city?: string;
    country?: string;
  };
};

type LocalStoredOrder = Partial<AdminOrder> & {
  id?: string;
  status?: string;
  customerName?: string;
  email?: string;
  shippingAddress?: {
    fullName?: string;
    email?: string;
    city?: string;
    country?: string;
  };
};

const buildLocalOrderId = () => `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        const result = await response.json();

        if (!isMounted) {
          return;
        }

        const apiOrders = response.ok && result.success ? result.data.orders ?? [] : [];
        const localOrders = (() => {
          try {
            return JSON.parse(window.localStorage.getItem("morrow-orders") ?? "[]");
          } catch {
            return [];
          }
        })();

        const merged = [...apiOrders, ...localOrders].map((order) => ({
          _id: order._id ?? order.id ?? buildLocalOrderId(),
          createdAt: order.createdAt ?? new Date().toISOString(),
          total: Number(order.total ?? 0),
          orderStatus: order.orderStatus ?? "pending",
          paymentStatus: order.paymentStatus ?? "paid",
          shippingAddress: order.shippingAddress ?? {
            fullName: order.customerName ?? "ضيف",
            email: order.email ?? "-",
          },
        }));

        setOrders(merged);
      } catch {
        try {
          const localOrders = JSON.parse(window.localStorage.getItem("morrow-orders") ?? "[]") as LocalStoredOrder[];
          setOrders(
            localOrders.map((order) => ({
              _id: order.id ?? buildLocalOrderId(),
              createdAt: order.createdAt ?? new Date().toISOString(),
              total: Number(order.total ?? 0),
              orderStatus: order.status === "تم الشحن" ? "shipped" : "pending",
              paymentStatus: "paid",
              shippingAddress: {
                fullName: order.shippingAddress?.fullName ?? "ضيف",
                email: order.shippingAddress?.email ?? "-",
              },
            }))
          );
        } catch {
          setOrders([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusChange = async (orderId: string, orderStatus: OrderStatus) => {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus }),
    });

    if (response.ok) {
      setOrders((current) =>
        current.map((order) =>
          order._id === orderId ? { ...order, orderStatus } : order
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" dir="rtl">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">الطلبات</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">إدارة الطلبات</h1>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.9fr_0.9fr] gap-4 border-b border-neutral-200 px-5 py-4 text-sm font-medium text-neutral-600">
            <span>الطلب</span>
            <span>العميل</span>
            <span>الإجمالي</span>
            <span>الدفع</span>
            <span>الحالة</span>
          </div>

          {isLoading ? (
            <div className="px-5 py-6 text-sm text-neutral-500">جاري تحميل الطلبات...</div>
          ) : orders.length === 0 ? (
            <div className="px-5 py-6 text-sm text-neutral-500">لا توجد طلبات حتى الآن.</div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="grid grid-cols-[1.2fr_1fr_0.8fr_0.9fr_0.9fr] gap-4 border-b border-neutral-200 px-5 py-4 text-sm last:border-0">
                <div>
                  <p className="font-medium text-neutral-900">#{String(order._id).slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-neutral-800">{order.shippingAddress?.fullName || "ضيف"}</p>
                  <p className="text-xs text-neutral-500">{order.shippingAddress?.email || "-"}</p>
                </div>
                <span className="text-neutral-900">{formatCurrency(order.total)}</span>
                <span className="text-neutral-700 capitalize">{order.paymentStatus}</span>
                <select
                  value={order.orderStatus}
                  onChange={(event) => handleStatusChange(order._id, event.target.value as OrderStatus)}
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.02)" }}
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="processing">قيد المعالجة</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التسليم</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
