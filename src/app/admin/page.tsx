import Link from "next/link";
import { ArrowUpRight, Package, Settings, ShoppingCart, Users, Wallet } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const lowStockProducts = mockProducts
  .filter((product) => product.stock <= 10)
  .slice(0, 3)
  .map((product) => ({ name: product.name, stock: product.stock }));

const recentOrders = [
  { id: "ORD-1001", status: "قيد المعالجة", total: 329 },
  { id: "ORD-1002", status: "تم الشحن", total: 142 },
  { id: "ORD-1003", status: "تم التسليم", total: 86 },
];

const totalRevenue = mockProducts.reduce((sum, product) => sum + product.price, 0);
const stats = [
  { label: "إجمالي المنتجات", value: String(mockProducts.length), change: "+12%", icon: Package, accent: "border border-neutral-200 bg-white text-neutral-700" },
  { label: "إجمالي الطلبات", value: "1,438", change: "+9%", icon: ShoppingCart, accent: "border border-neutral-200 bg-white text-neutral-700" },
  { label: "إجمالي الإيرادات", value: formatCurrency(totalRevenue), change: "+16%", icon: Wallet, accent: "border border-neutral-200 bg-white text-neutral-700" },
  { label: "إجمالي العملاء", value: "3,842", change: "+18%", icon: Users, accent: "border border-neutral-200 bg-white text-neutral-700" },
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" dir="rtl">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">لوحة التحكم</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">نظرة عامة</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/orders" className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50">الطلبات</Link>
            <Link href="/admin/settings" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: "var(--brand-accent, #171717)" }}>
              <Settings size={14} /> الإعدادات
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ icon: Icon, label, value, change, accent }) => (
            <div key={label} className="rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                  <Icon size={18} />
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <ArrowUpRight size={12} /> {change}
                </span>
              </div>
              <p className="mt-5 text-sm text-neutral-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-neutral-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-950">الطلبات الأخيرة</h2>
            <div className="mt-5 space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div>
                    <p className="font-medium text-neutral-900">{order.id}</p>
                    <p className="text-sm text-neutral-500">{order.status}</p>
                  </div>
                  <p className="font-semibold text-neutral-900">{formatCurrency(order.total)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-950">المخزون المنخفض</h2>
            <div className="mt-5 space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <span className="font-medium text-neutral-900">{product.name}</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">{product.stock} متبقي</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
