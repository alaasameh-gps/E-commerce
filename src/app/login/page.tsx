"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Navbar } from "@/components/layout/navbar";

const loginSchema = z.object({
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 text-neutral-900"><Navbar /><main className="mx-auto flex max-w-5xl items-center justify-center px-4 py-14 sm:px-6 lg:px-8"><div className="w-full max-w-md rounded-[2rem] border border-neutral-200 bg-white p-7 shadow-sm text-sm text-neutral-500">Loading...</div></main></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError("root", { message: result.message || "فشل تسجيل الدخول" });
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("root", { message: "تعذر تسجيل الدخول الآن. الرجاء المحاولة مرة أخرى." });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <main className="mx-auto flex max-w-5xl items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-[2rem] border border-neutral-200 bg-white p-7 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">مرحباً بعودتك</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">تسجيل الدخول إلى حسابك</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
              {isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-neutral-600">
            ليس لديك حساب؟ <Link href="/register" className="font-medium text-neutral-900 hover:text-neutral-700">إنشاء حساب</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
