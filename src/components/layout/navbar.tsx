"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Search, ShieldCheck, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";

type SiteBrand = {
  storeName: string;
  logoUrl: string;
  primaryColor: string;
};

type SessionUser = {
  id: string;
  email: string;
  role: "user" | "admin";
};

export function Navbar() {
  const router = useRouter();
  const { itemCount } = useCart();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [brand, setBrand] = useState<SiteBrand>({
    storeName: "متجرنا",
    logoUrl: "",
    primaryColor: "#171717",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const [userResponse, settingsResponse] = await Promise.all([
          fetch("/api/auth/me", { credentials: "include" }),
          fetch("/api/admin/settings", { credentials: "include" }),
        ]);

        const userResult = await userResponse.json();
        const settingsResult = await settingsResponse.json();

        if (!isMounted) {
          return;
        }

        setUser(userResult.success && userResult.data ? userResult.data : null);

        if (settingsResult.success && settingsResult.data) {
          setBrand({
            storeName: settingsResult.data.storeName || "متجرنا",
            logoUrl: settingsResult.data.logoUrl || "",
            primaryColor: settingsResult.data.primaryColor || "#171717",
          });
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setBrand({
            storeName: "متجرنا",
            logoUrl: "",
            primaryColor: "#171717",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchTerm.trim();
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-base font-bold tracking-tight text-neutral-950">
          {brand.logoUrl ? (
            <Image
              src={brand.logoUrl}
              alt={brand.storeName}
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl border border-neutral-200 bg-neutral-50 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-xs font-bold text-neutral-700 shadow-sm">
              {brand.storeName.trim().slice(0, 1) || "م"}
            </div>
          )}
          <span className="truncate">{brand.storeName}</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm text-neutral-600 md:flex">
          <Link href="/" className="rounded-full px-2.5 py-2 font-medium transition hover:bg-neutral-100 hover:text-neutral-950">الرئيسية</Link>
          <Link href="/products" className="rounded-full px-2.5 py-2 font-medium transition hover:bg-neutral-100 hover:text-neutral-950">المنتجات</Link>
          <Link href="/products?category=الإلكترونيات" className="rounded-full px-2.5 py-2 font-medium transition hover:bg-neutral-100 hover:text-neutral-950">الفئات</Link>
          {user?.role === "admin" ? (
            <Link href="/admin" className="inline-flex items-center gap-2 font-medium text-neutral-900 transition hover:text-neutral-600">
              <ShieldCheck size={14} /> لوحة التحكم
            </Link>
          ) : null}
        </nav>

        <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
          {user?.role === "admin" ? (
            <Link href="/admin/products" className="inline-flex items-center gap-2 font-medium text-neutral-900 transition hover:text-neutral-600">
              <ShieldCheck size={14} /> إدارة المتجر
            </Link>
          ) : null}

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
            <Search size={16} />
            <input
              aria-label="بحث عن المنتجات"
              placeholder="ابحث عن المنتجات"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-40 border-0 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
          </form>

          <Link href="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-950">
            <ShoppingBag size={18} />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1 text-[10px] font-medium text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>

          {!isLoading && user ? (
            <>
              <Link href="/orders" className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50">
                <UserRound size={16} />
                حسابي
              </Link>
              <button type="button" onClick={handleLogout} className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50">
                <LogOut size={16} />
                تسجيل الخروج
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50" style={{ borderColor: `${brand.primaryColor}66`, color: brand.primaryColor }}>
              <UserRound size={16} />
              تسجيل الدخول
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user?.role === "admin" ? (
            <Link href="/admin" className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-white" aria-label="لوحة التحكم">
              <ShieldCheck size={18} />
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700"
            aria-label="Open menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm text-neutral-700">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>الرئيسية</Link>
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}>المنتجات</Link>
            <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)}>السلة</Link>
            {user ? <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)}>طلباتي</Link> : null}
            {user?.role === "admin" ? <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>لوحة التحكم</Link> : null}
            {!user ? <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>تسجيل الدخول</Link> : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
