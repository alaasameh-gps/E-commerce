export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function calculateDiscount(price: number, compareAtPrice?: number | null) {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function createApiResponse<T>(success: boolean, data?: T, message?: string, errors?: Record<string, unknown>) {
  return {
    success,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
    ...(errors ? { errors } : {}),
  };
}
