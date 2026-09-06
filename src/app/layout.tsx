import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CartProvider } from "@/components/providers/cart-provider";
import { getSiteSettings } from "@/lib/site-settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "متجرنا | متجر إلكتروني فاخر",
  description: "متجر إلكتروني عربي أنيق مع تجربة شراء حديثة ولوحة تحكم إدارية متكاملة.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-white text-neutral-900"
        style={{
          ["--brand-accent" as string]: settings.primaryColor,
        }}
      >
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
