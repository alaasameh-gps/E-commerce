"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Navbar } from "@/components/layout/navbar";
import { formatCurrency } from "@/lib/utils";

type Product = {
  _id?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  brand: string;
  images: string[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      const response = await fetch("/api/products?limit=100");
      const result = await response.json();

      if (!isMounted) {
        return;
      }

      if (response.ok && result.success) {
        setProducts(result.data.products ?? []);
      }

      setIsLoading(false);
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (productId?: string) => {
    if (!productId) return;

    const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    if (response.ok) {
      setProducts((current) => current.filter((product) => product._id !== productId));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" dir="rtl">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">المنتجات</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">إدارة المخزون</h1>
          </div>
          <Link href="/admin/products/new" className="rounded-full px-5 py-3 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: "var(--brand-accent, #171717)" }}>
            إضافة منتج
          </Link>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.6fr_0.7fr] gap-4 border-b border-neutral-200 px-5 py-4 text-sm font-medium text-neutral-600">
            <span>المنتج</span>
            <span>الفئة</span>
            <span>السعر</span>
            <span>المخزون</span>
            <span>الإجراءات</span>
          </div>

          {isLoading ? (
            <div className="px-5 py-6 text-sm text-neutral-500">جاري تحميل المنتجات...</div>
          ) : products.length === 0 ? (
            <div className="px-5 py-6 text-sm text-neutral-500">لا توجد منتجات.</div>
          ) : (
            products.map((product) => (
              <div key={product._id} className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.6fr_0.7fr] gap-4 border-b border-neutral-200 px-5 py-4 text-sm last:border-0">
                <div className="flex items-center gap-3">
                  <Image src={product.images?.[0] || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=200&q=80"} alt={product.name} width={48} height={48} className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-medium text-neutral-900">{product.name}</p>
                    <p className="text-xs text-neutral-500">{product.brand}</p>
                  </div>
                </div>
                <span className="text-neutral-700">{product.category}</span>
                <span className="text-neutral-900">{formatCurrency(product.price)}</span>
                <span className="text-neutral-900">{product.stock}</span>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/products/${product._id}/edit`} className="text-neutral-700 hover:text-neutral-950">تعديل</Link>
                  <span className="text-neutral-300">|</span>
                  <button type="button" onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-700">حذف</button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
