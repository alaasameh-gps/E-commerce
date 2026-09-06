"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { z } from "zod";

import { Navbar } from "@/components/layout/navbar";
import { useCart } from "@/components/providers/cart-provider";
import { formatCurrency } from "@/lib/utils";

const shippingSchema = z.object({
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  phone: z.string().min(7, "رقم الهاتف مطلوب"),
  country: z.string().min(2, "الدولة مطلوبة"),
  city: z.string().min(2, "المدينة مطلوبة"),
  postalCode: z.string().min(3, "الرمز البريدي مطلوب"),
  address: z.string().min(5, "العنوان مطلوب"),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

const coupons: Record<string, number> = {
  SAVE10: 0.1,
  WELCOME20: 0.2,
  FREESHIP: 0,
};

const buildOrderId = () => `ORD-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState("");

  const shipping = subtotal > 150 ? 0 : 12;
  const discountRate = appliedCoupon ? (coupons[appliedCoupon] ?? 0) : 0;
  const discountAmount = subtotal * discountRate;
  const total = subtotal + shipping - discountAmount;

  const orderSummary = useMemo(() => ({
    subtotal,
    shipping,
    discountAmount,
    total,
  }), [subtotal, shipping, discountAmount, total]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      postalCode: "",
      address: "",
    },
  });

  const applyCoupon = () => {
    const normalized = couponCode.trim().toUpperCase();
    if (!normalized) {
      setAppliedCoupon(null);
      setCouponMessage("أدخل رمز الخصم أولاً.");
      return;
    }

    if (normalized === "FREESHIP") {
      setAppliedCoupon(normalized);
      setCouponMessage("تم تطبيق خصم الشحن مجاناً.");
      return;
    }

    if (normalized in coupons) {
      setAppliedCoupon(normalized);
      setCouponMessage(`تم تطبيق خصم ${coupons[normalized] * 100}%`);
      return;
    }

    setAppliedCoupon(null);
    setCouponMessage("رمز الخصم غير صالح.");
  };

  const onSubmit = async (values: ShippingFormValues) => {
    if (!items.length) {
      setError("root", { message: "سلة التسوق فارغة." });
      return;
    }

    try {
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          country: values.country,
          city: values.city,
          address: values.address,
          postalCode: values.postalCode,
        },
        subtotal,
        shipping,
        total: orderSummary.total,
        paymentStatus: "paid",
        orderStatus: "pending",
      };

      let orderRecord: {
        id: string;
        createdAt: string;
        status: string;
        subtotal: number;
        shipping: number;
        discount: number;
        total: number;
        items: Array<{ productId: string; name: string; image: string; quantity: number; price: number }>;
        shippingAddress: typeof orderPayload.shippingAddress;
        coupon?: string | null;
      } | null = null;

      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderPayload),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          const apiOrder = result.data;
          orderRecord = {
            id: String(apiOrder._id ?? apiOrder.id ?? buildOrderId()),
            createdAt: apiOrder.createdAt ?? new Date().toISOString(),
            status: "قيد المعالجة",
            subtotal: Number(apiOrder.subtotal ?? subtotal),
            shipping: Number(apiOrder.shipping ?? shipping),
            discount: Number(apiOrder.discount ?? discountAmount),
            total: Number(apiOrder.total ?? orderSummary.total),
            items: apiOrder.items ?? orderPayload.items,
            shippingAddress: apiOrder.shippingAddress ?? orderPayload.shippingAddress,
            coupon: appliedCoupon,
          };
        }
      } catch {
        orderRecord = null;
      }

      if (!orderRecord) {
        orderRecord = {
          id: buildOrderId(),
          createdAt: new Date().toISOString(),
          status: "قيد المعالجة",
          subtotal,
          shipping,
          discount: discountAmount,
          total: orderSummary.total,
          items: orderPayload.items,
          shippingAddress: orderPayload.shippingAddress,
          coupon: appliedCoupon,
        };
      }

      const saved = JSON.parse(window.localStorage.getItem("morrow-orders") ?? "[]") as Array<typeof orderRecord>;
      window.localStorage.setItem("morrow-orders", JSON.stringify([orderRecord, ...saved]));

      clearCart();
      router.push("/orders");
      router.refresh();
    } catch {
      setError("root", { message: "تعذر إرسال الطلب الآن." });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">الدفع</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-950">تفاصيل الشحن</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <input {...register("fullName")} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none" placeholder="الاسم الكامل" />
                  {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
                </div>
                <div>
                  <input {...register("email")} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none" placeholder="البريد الإلكتروني" type="email" />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                  <input {...register("phone")} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none" placeholder="رقم الهاتف" />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                </div>
                <div>
                  <input {...register("country")} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none" placeholder="الدولة" />
                  {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country.message}</p>}
                </div>
                <div>
                  <input {...register("city")} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none" placeholder="المدينة" />
                  {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
                </div>
                <div>
                  <input {...register("postalCode")} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none" placeholder="الرمز البريدي" />
                  {errors.postalCode && <p className="mt-1 text-xs text-red-600">{errors.postalCode.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <input {...register("address")} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none" placeholder="عنوان الشارع" />
                  {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <label className="block text-sm font-medium text-neutral-700">رمز الخصم</label>
              <div className="mt-3 flex gap-2">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="SAVE10 / WELCOME20 / FREESHIP"
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none"
                />
                <button type="button" onClick={applyCoupon} className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: "var(--brand-accent, #171717)" }}>
                  تطبيق
                </button>
              </div>
              {couponMessage ? <p className="mt-2 text-xs text-neutral-600">{couponMessage}</p> : null}
            </div>

            {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

            <button type="submit" disabled={isSubmitting || items.length === 0} className="inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70" style={{ backgroundColor: "var(--brand-accent, #171717)" }}>
              {isSubmitting ? "جاري إرسال الطلب..." : "إرسال الطلب"}
            </button>
          </form>

          <aside className="rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-xl font-semibold text-neutral-950">ملخص الطلب</h2>
            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-xl bg-neutral-100">
                    <Image src={item.image} alt={item.name} width={56} height={56} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
                    <p className="text-xs text-neutral-500">الكمية: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-neutral-900">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-neutral-200 pt-4 text-sm text-neutral-600">
              <div className="flex items-center justify-between">
                <span>المجموع الفرعي</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>الشحن</span>
                <span>{shipping === 0 ? "مجاني" : formatCurrency(shipping)}</span>
              </div>
              {appliedCoupon ? (
                <div className="mt-3 flex items-center justify-between text-emerald-600">
                  <span>الخصم</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              ) : null}
              <div className="mt-4 flex items-center justify-between text-base font-semibold text-neutral-950">
                <span>الإجمالي</span>
                <span>{formatCurrency(Math.max(orderSummary.total, 0))}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
