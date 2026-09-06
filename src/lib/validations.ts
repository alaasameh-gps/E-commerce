import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  slug: z.string().min(2).max(160).optional(),
  description: z.string().min(10, "Description is too short").max(2000),
  price: z.coerce.number().positive("Price must be greater than zero"),
  compareAtPrice: z.coerce.number().nonnegative().optional().nullable(),
  images: z.array(z.string().url().or(z.string().min(1))).min(1, "At least one image is required"),
  category: z.string().min(2, "Category is required"),
  brand: z.string().min(2, "Brand is required"),
  stock: z.coerce.number().int().nonnegative(),
  rating: z.coerce.number().min(0).max(5).optional(),
  numReviews: z.coerce.number().int().nonnegative().optional(),
  featured: z.boolean().optional(),
});

export const productUpdateSchema = productSchema.partial();

export const userRegisterSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const userLoginSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(6, "Password is required"),
});

export const siteSettingsSchema = z.object({
  storeName: z.string().min(2, "Store name is required").max(80),
  tagline: z.string().min(2, "Tagline is required").max(160),
  description: z.string().min(10, "Description is too short").max(500),
  primaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Primary color must be a valid hex color"),
  logoUrl: z
    .string()
    .trim()
    .refine((value) => {
      if (!value || value === "/logo.svg") {
        return true;
      }

      if (value.startsWith("/")) {
        return value.startsWith("/uploads/");
      }

      if (!/^https?:\/\//i.test(value)) {
        return false;
      }

      try {
        const parsed = new URL(value);
        const host = parsed.hostname.toLowerCase();
        const isAllowedHost = host === "images.unsplash.com" || host === "i.postimg.cc";
        const isAllowedExtension = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(parsed.pathname);
        return isAllowedHost && isAllowedExtension;
      } catch {
        return false;
      }
    }, "Logo must be a valid direct image path or a trusted image URL"),
  contactEmail: z.string().email("Please provide a valid support email"),
  phone: z.string().min(6, "Phone number is required").max(30).optional(),
  currency: z.string().min(2).max(10).optional(),
  supportPhone: z.string().min(6, "Phone number is required").max(30).optional(),
}).transform((value) => ({
  ...value,
  phone: value.phone ?? value.supportPhone ?? "+966500000000",
  currency: value.currency ?? "SAR",
}));

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  country: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(5),
  postalCode: z.string().min(3),
});

export const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      image: z.string(),
      quantity: z.number().int().min(1),
      price: z.number().positive(),
    })
  ).min(1, "Cart cannot be empty"),
  shippingAddress: shippingAddressSchema,
  subtotal: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  total: z.number().positive(),
  paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
  orderStatus: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
});
