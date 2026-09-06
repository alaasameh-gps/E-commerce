"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Navbar } from "@/components/layout/navbar";

const productFormSchema = z.object({
  name: z.string().min(2, "اسم المنتج مطلوب"),
  description: z.string().min(10, "وصف المنتج قصير جدًا"),
  price: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
  compareAtPrice: z.number().nonnegative().optional().nullable(),
  category: z.string().min(2, "الفئة مطلوبة"),
  brand: z.string().min(2, "اسم العلامة التجارية مطلوب"),
  stock: z.number().int().nonnegative("المخزون يجب أن يكون صفر أو أكثر"),
  imageUrl: z.string().url("يرجى إدخال رابط صورة صحيح"),
  featured: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function NewProductPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      compareAtPrice: undefined,
      category: "",
      brand: "",
      stock: 0,
      imageUrl: "",
      featured: false,
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    const parsed = productFormSchema.safeParse(values);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const field = firstIssue.path[0] as keyof ProductFormValues | undefined;

      if (field) {
        setError(field, { message: firstIssue.message });
      } else {
        setError("root", { message: "Please review the form and try again." });
      }

      return;
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          compareAtPrice: parsed.data.compareAtPrice ?? null,
          images: [parsed.data.imageUrl],
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError("root", { message: result.message || "Unable to save product" });
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("root", { message: "Unable to create the product right now." });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" dir="rtl">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">الإدارة</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">إضافة منتج جديد</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-neutral-700">اسم المنتج</label>
              <input {...register("name")} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-400" placeholder="مصباح لوما السيراميكي" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-neutral-700">الوصف</label>
              <textarea {...register("description")} rows={5} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-400" placeholder="اكتب وصف المنتج" />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">السعر</label>
              <input type="number" step="0.01" {...register("price", { valueAsNumber: true })} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-400" placeholder="79" />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">السعر المقارن</label>
              <input type="number" step="0.01" {...register("compareAtPrice", { valueAsNumber: true })} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-400" placeholder="99" />
              {errors.compareAtPrice && <p className="mt-1 text-sm text-red-600">{String(errors.compareAtPrice.message)}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">الفئة</label>
              <input {...register("category")} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-400" placeholder="المنزل" />
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">العلامة التجارية</label>
              <input {...register("brand")} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-400" placeholder="لوما" />
              {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">المخزون</label>
              <input type="number" {...register("stock", { valueAsNumber: true })} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-400" placeholder="42" />
              {errors.stock && <p className="mt-1 text-sm text-red-600">{String(errors.stock.message)}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">رابط الصورة</label>
              <input type="url" {...register("imageUrl")} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-400" placeholder="https://..." />
              {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>}
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <input type="checkbox" {...register("featured")} className="h-4 w-4" />
              <span className="text-sm text-neutral-700">منتج مميز</span>
            </div>
          </div>

          {errors.root && <p className="mt-4 text-sm text-red-600">{errors.root.message}</p>}

          <button type="submit" disabled={isSubmitting} className="mt-6 inline-flex rounded-full bg-neutral-950 px-5 py-3.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? "جارٍ الحفظ..." : "حفظ المنتج"}
          </button>
        </form>
      </main>
    </div>
  );
}
