"use client";

import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { ProductCard } from "@/components/products/product-card";
import { mockProducts } from "@/lib/mock-data";

const categories = ["الكل", "الإلكترونيات", "الموضة", "الأحذية", "الإكسسوارات", "المنزل"];

const categoryMap: Record<string, string> = {
  الكل: "all",
  الإلكترونيات: "Electronics",
  الموضة: "Fashion",
  الأحذية: "Shoes",
  الإكسسوارات: "Accessories",
  المنزل: "Home",
};

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("featured");

  const selectedCategory = searchParams.get("category") ?? "الكل";
  const searchTerm = (searchParams.get("search") ?? "").trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    const mappedCategory = categoryMap[selectedCategory] ?? "all";

    let results = mockProducts.filter((product) => {
      const matchesCategory = mappedCategory === "all" || product.category === mappedCategory;
      const searchableText = `${product.name} ${product.description} ${product.category} ${product.brand}`.toLowerCase();
      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
      return matchesCategory && matchesSearch;
    });

    switch (sort) {
      case "price-asc":
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        results = [...results].sort((a, b) => b.rating - a.rating);
        break;
      default:
        results = [...results].sort((a, b) => Number(b.featured) - Number(a.featured));
        break;
    }

    return results;
  }, [searchTerm, selectedCategory, sort]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">المجموعة</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">تسوق كل المنتجات</h1>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className="inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-100"
          >
            <SlidersHorizontal size={16} />
            التصفية
          </button>
        </div>

        {showFilters ? (
          <div className="mb-8 rounded-[1.5rem] border border-neutral-200 bg-white p-4 shadow-sm">
            <label className="block text-sm font-medium text-neutral-700">ترتيب حسب</label>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-800 outline-none focus:border-neutral-400"
            >
              <option value="featured">الأكثر مبيعاً</option>
              <option value="price-asc">السعر: من الأقل إلى الأعلى</option>
              <option value="price-desc">السعر: من الأعلى إلى الأقل</option>
              <option value="rating">الأعلى تقييماً</option>
            </select>
          </div>
        ) : null}

        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => {
            const isActive = category === selectedCategory;
            return (
              <Link
                key={category}
                href={category === "الكل" ? "/products" : `/products?category=${encodeURIComponent(category)}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-neutral-950 text-white"
                    : "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100"
                }`}
              >
                {category}
              </Link>
            );
          })}
        </div>

        <div className="mb-4 text-sm text-neutral-600">
          {filteredProducts.length} منتج متاح
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => <ProductCard key={product._id} product={product} />)
          ) : (
            <div className="col-span-full rounded-[1.75rem] border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-600">
              لا توجد منتجات تطابق البحث الحالي.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 px-4 py-10 text-center text-neutral-600">جارٍ تحميل المنتجات...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
