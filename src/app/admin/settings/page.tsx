"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Navbar } from "@/components/layout/navbar";

const defaultSettings = {
  storeName: "متجرنا",
  tagline: "ارفع مستوى كل يوم بمستلزمات عصرية وأنيقة.",
  description: "اكتشف منتجات فاخرة للعمل والسفر والمنزل، ومجموعات مختارة لتجعل حياتك أكثر رفاهية وأناقة.",
  primaryColor: "#171717",
  logoUrl: "",
  contactEmail: "support@morrow.com",
  phone: "+966500000000",
  currency: "SAR",
};

const allowedLogoTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
const maxLogoSize = 2 * 1024 * 1024;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [logoPreview, setLogoPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const response = await fetch("/api/admin/settings", { credentials: "include" });
      const result = await response.json();

      if (response.ok && result.success && result.data) {
        const nextSettings = {
          ...defaultSettings,
          ...result.data,
          phone: result.data.phone ?? result.data.supportPhone ?? defaultSettings.phone,
          currency: result.data.currency ?? defaultSettings.currency,
          logoUrl: result.data.logoUrl ?? "",
        };
        setSettings(nextSettings);
        setLogoPreview(nextSettings.logoUrl || "");
      }

      setIsLoading(false);
    };

    void loadSettings();
  }, []);

  const handleChange = (field: keyof typeof defaultSettings, value: string) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!allowedLogoTypes.includes(file.type)) {
      alert("نوع الملف غير مسموح. استخدم PNG أو JPG أو GIF أو WEBP فقط.");
      event.target.value = "";
      return;
    }

    if (file.size > maxLogoSize) {
      alert("حجم الصورة كبير جداً. الحد المسموح هو 2MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("logo", file);
    setIsUploadingLogo(true);

    try {
      const response = await fetch("/api/admin/settings/logo", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "فشل في رفع الشعار");
      }

      const nextLogoUrl = result.logoUrl || "";
      setSettings((current) => ({ ...current, logoUrl: nextLogoUrl }));
      setLogoPreview(nextLogoUrl);
      alert("تم رفع الشعار بنجاح");
    } catch (error) {
      alert(error instanceof Error ? error.message : "فشل في رفع الشعار");
    } finally {
      setIsUploadingLogo(false);
      event.target.value = "";
    }
  };

  const handleRemoveLogo = async () => {
    const nextSettings = { ...settings, logoUrl: "" };
    setSettings(nextSettings);
    setLogoPreview("");

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nextSettings),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "فشل في حذف الشعار");
      }

      alert("تم حذف الشعار بنجاح");
    } catch (error) {
      alert(error instanceof Error ? error.message : "فشل في حذف الشعار");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(settings),
    });

    const result = await response.json();
    setIsSaving(false);

    if (!response.ok || !result.success) {
      alert(result.message || "فشل في حفظ الإعدادات");
      return;
    }

    setLogoPreview(settings.logoUrl || "");
    alert("تم حفظ إعدادات المتجر بنجاح");
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" dir="rtl">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">الإعدادات</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">إعدادات المتجر</h1>
        </div>

        {isLoading ? (
          <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 text-sm text-neutral-600 shadow-sm">جاري تحميل الإعدادات...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm text-neutral-700">
                <span>اسم المتجر</span>
                <input value={settings.storeName} onChange={(e) => handleChange("storeName", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none" />
              </label>

              <label className="space-y-2 text-sm text-neutral-700">
                <span>اللون الأساسي</span>
                <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <input type="color" value={settings.primaryColor} onChange={(e) => handleChange("primaryColor", e.target.value)} className="h-10 w-12 rounded border-0 bg-transparent p-0" />
                  <input value={settings.primaryColor} onChange={(e) => handleChange("primaryColor", e.target.value)} className="w-full border-0 bg-transparent text-sm outline-none" />
                </div>
              </label>

              <div className="space-y-2 text-sm text-neutral-700 md:col-span-2">
                <span>شعار المتجر</span>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      {logoPreview ? (
                        <Image src={logoPreview} alt={settings.storeName} width={56} height={56} className="h-14 w-14 rounded-xl border border-neutral-200 bg-white object-cover" />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-200 bg-white text-lg font-bold text-neutral-700">
                          {settings.storeName.trim().slice(0, 1) || "م"}
                        </div>
                      )}
                      <div className="text-xs text-neutral-500">
                        <p>الصيغ المسموح بها: PNG, JPG, GIF, WEBP</p>
                        <p>الحد الأقصى: 2MB</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800">
                        رفع صورة
                        <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" className="hidden" onChange={handleLogoUpload} />
                      </label>
                      <button type="button" onClick={handleRemoveLogo} className="rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100" disabled={!logoPreview || isUploadingLogo || isSaving}>
                        حذف الشعار
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <label className="space-y-2 text-sm text-neutral-700 md:col-span-2">
                <span>الشعار أو العنوان</span>
                <input value={settings.tagline} onChange={(e) => handleChange("tagline", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none" />
              </label>

              <label className="space-y-2 text-sm text-neutral-700 md:col-span-2">
                <span>الوصف</span>
                <textarea value={settings.description} onChange={(e) => handleChange("description", e.target.value)} rows={4} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none" />
              </label>

              <label className="space-y-2 text-sm text-neutral-700">
                <span>البريد الإلكتروني</span>
                <input type="email" value={settings.contactEmail} onChange={(e) => handleChange("contactEmail", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none" />
              </label>

              <label className="space-y-2 text-sm text-neutral-700">
                <span>رقم الدعم</span>
                <input value={settings.phone} onChange={(e) => handleChange("phone", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none" />
              </label>

              <label className="space-y-2 text-sm text-neutral-700">
                <span>العملة</span>
                <input value={settings.currency} onChange={(e) => handleChange("currency", e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none" />
              </label>
            </div>

            <div className="flex items-center justify-end">
              <button type="submit" disabled={isSaving || isUploadingLogo} className="rounded-full px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-70" style={{ backgroundColor: "var(--brand-accent, #171717)" }}>
                {isSaving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
