import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Sparkles, Truck, Star } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { ProductCard } from "@/components/products/product-card";
import { getCurrentUser } from "@/lib/auth";
import { mockProducts } from "@/lib/mock-data";
import { getSiteSettings } from "@/lib/site-settings";

const categories = [
  { name: "الإلكترونيات", count: "128 عنصر" },
  { name: "الموضة", count: "84 عنصر" },
  { name: "الأحذية", count: "57 عنصر" },
  { name: "الإكسسوارات", count: "43 عنصر" },
  { name: "المنزل", count: "92 عنصر" },
];

export default async function HomePage() {
  const settings = await getSiteSettings();
  const user = await getCurrentUser();
  const featured = mockProducts.filter((product) => product.featured).slice(0, 4);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-neutral-700">
              <Sparkles size={12} className="text-amber-500" /> وصولات الموسم الجديد
            </span>
            <div className="mb-4 flex items-center gap-3">
              {settings.logoUrl ? (
                <Image
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-lg font-bold text-neutral-700">
                  {settings.storeName.trim().slice(0, 1) || "م"}
                </div>
              )}
              <p className="text-sm font-medium text-neutral-500">{settings.storeName}</p>
            </div>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
              {settings.tagline}
            </h1>
            <p className="mt-6 max-w-lg text-lg text-neutral-600">
              {settings.description}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/products" className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-medium text-white transition hover:opacity-95" style={{ backgroundColor: settings.primaryColor }}>
                ابدأ التسوق <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link href="/products?featured=true" className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-6 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100">
                الأكثر مبيعاً
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-neutral-600">
              <span className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> شحن مجاني</span>
              <span className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> إرجاع خلال 30 يوم</span>
              <span className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> الدفع الآمن</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-neutral-100 to-neutral-200 blur-3xl" />
            <div className="relative w-full overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
                alt="Premium lifestyle photography"
                width={1200}
                height={900}
                className="h-[540px] w-full rounded-[1.5rem] object-cover"
              />
              <div className="absolute bottom-8 left-8 rounded-2xl border border-white/60 bg-white/85 p-4 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Star size={15} className="fill-amber-500 text-amber-500" /> تقييم 4.9
                </div>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">+12 ألف عميل راضٍ</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">تسوق حسب الفئة</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">مجموعات مختارة بعناية</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 group-hover:bg-neutral-950 group-hover:text-white">
                  <Sparkles size={18} />
                </div>
                <h3 className="text-lg font-medium text-neutral-900">{category.name}</h3>
                <p className="mt-2 text-sm text-neutral-500">{category.count}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">منتجات مختارة</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">الأكثر رواجاً الآن</h2>
              </div>
              <Link href="/products" className="text-sm font-medium text-neutral-700 hover:text-neutral-950">
                تصفح جميع المنتجات
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-neutral-200 p-8 text-white shadow-lg md:p-12" style={{ backgroundColor: settings.primaryColor }}>
            <div className="grid gap-10 md:grid-cols-[1fr_0.9fr] md:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-neutral-300">هذا الأسبوع فقط</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">وفر حتى 40% على منتجاتنا الأساسية المصممة بعناية.</h2>
              </div>
              <div className="flex flex-col items-start gap-4 md:items-end">
                <p className="text-neutral-300">قطع مختارة بعناية لتناسب أسلوب الحياة العصري وتجعل روتينك أسهل.</p>
                <Link href="/products" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200">
                  اكتشف العروض
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">لماذا نحن</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">مصمم لتجربة تسوق أفضل</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: Truck, title: "توصيل سريع", text: "شحن سريع مع متابعة مباشرة لجميع الطلبات." },
                { icon: ShieldCheck, title: "دفع آمن", text: "مدفوعات محمية ودعم عملاء موثوق." },
                { icon: Sparkles, title: "جودة مميزة", text: "منتجات مختارة بعناية من خلال التصميم والحرفية." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-950 text-white">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-xl font-medium text-neutral-900">{title}</h3>
                  <p className="mt-3 text-neutral-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-neutral-200 bg-neutral-100 px-6 py-10 text-center md:px-12">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">النشرة البريدية</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">احصل على أول وصول إلى المنتجات الجديدة والعروض</h2>
            <div className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none ring-0 placeholder:text-neutral-400"
              />
              <button className="rounded-full px-6 py-3.5 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: settings.primaryColor }}>
                انضم الآن
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 text-sm text-neutral-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-neutral-950">
              {settings.logoUrl ? (
                <Image
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-xs font-bold text-neutral-700">
                  {settings.storeName.trim().slice(0, 1) || "م"}
                </div>
              )}
              <span>{settings.storeName}</span>
            </div>
            <p className="mt-2 max-w-md">{settings.description}</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link href="/products">المنتجات</Link>
            <Link href="/orders">الطلبات</Link>
            <Link href="/login">تسجيل الدخول</Link>
            {user?.role === "admin" ? <Link href="/admin">الإدارة</Link> : null}
          </div>
        </div>
      </footer>
    </div>
  );
}
