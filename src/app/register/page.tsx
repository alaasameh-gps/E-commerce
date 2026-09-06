"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Navbar } from "@/components/layout/navbar";

const registerSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError("root", { message: result.message || "فشل إنشاء الحساب" });
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("root", { message: "تعذر إنشاء الحساب الآن." });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <main className="mx-auto flex max-w-5xl items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-[2rem] border border-neutral-200 bg-white p-7 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">إنشاء حساب</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">انضم إلى متجرنا</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">الاسم الكامل</label>
              <input
                {...register("name")}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                placeholder="أحمد محمد"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">البريد الإلكتروني</label>
              <input
                type="email"
                {...register("email")}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                placeholder="name@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">كلمة المرور</label>
              <input
                type="password"
                {...register("password")}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

            <button type="submit" disabled={isSubmitting} className="w-full rounded-full px-5 py-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70" style={{ backgroundColor: "var(--brand-accent, #171717)" }}>
              {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-neutral-600">
            لديك حساب بالفعل؟ <Link href="/login" className="font-medium text-neutral-900 hover:text-neutral-700">تسجيل الدخول</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
