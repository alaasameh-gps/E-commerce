import { connectToDatabase } from "@/lib/mongodb";

const ALLOWED_LOGO_HOSTS = new Set(["images.unsplash.com", "i.postimg.cc"]);

export type SiteSettings = {
  storeName: string;
  tagline: string;
  description: string;
  primaryColor: string;
  logoUrl: string;
  contactEmail: string;
  phone: string;
  currency: string;
  supportPhone?: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  storeName: "متجرنا",
  tagline: "ارفع مستوى كل يوم بمستلزمات عصرية وأنيقة.",
  description: "اكتشف منتجات فاخرة للعمل والسفر والمنزل، ومجموعات مختارة لتجعل حياتك أكثر رفاهية وأناقة.",
  primaryColor: "#171717",
  logoUrl: "",
  contactEmail: "support@morrow.com",
  phone: "+966500000000",
  currency: "SAR",
  supportPhone: "+966500000000",
};

export function isValidLogoUrl(value?: string | null): boolean {
  const normalized = value?.trim() ?? "";

  if (!normalized || normalized === "/logo.svg") {
    return true;
  }

  if (normalized.startsWith("/")) {
    return normalized.startsWith("/uploads/") || normalized === "/logo.svg";
  }

  if (!/^https?:\/\//i.test(normalized)) {
    return false;
  }

  try {
    const parsed = new URL(normalized);
    const isAllowedHost = ALLOWED_LOGO_HOSTS.has(parsed.hostname.toLowerCase());
    const isAllowedImageExtension = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(parsed.pathname);
    return isAllowedHost && isAllowedImageExtension;
  } catch {
    return false;
  }
}

export function normalizeSiteSettings(raw: Partial<SiteSettings> | null | undefined): SiteSettings {
  const settings = raw ?? {};
  const rawLogo = settings.logoUrl ?? "";
  const validLogoUrl = isValidLogoUrl(rawLogo) ? rawLogo : "";

  return {
    storeName: settings.storeName || DEFAULT_SITE_SETTINGS.storeName,
    tagline: settings.tagline || DEFAULT_SITE_SETTINGS.tagline,
    description: settings.description || DEFAULT_SITE_SETTINGS.description,
    primaryColor: settings.primaryColor || DEFAULT_SITE_SETTINGS.primaryColor,
    logoUrl: validLogoUrl,
    contactEmail: settings.contactEmail || DEFAULT_SITE_SETTINGS.contactEmail,
    phone: settings.phone || settings.supportPhone || DEFAULT_SITE_SETTINGS.phone,
    currency: settings.currency || DEFAULT_SITE_SETTINGS.currency,
    supportPhone: settings.supportPhone || settings.phone || DEFAULT_SITE_SETTINGS.supportPhone,
  };
}

export async function ensureDefaultSiteSettings(): Promise<SiteSettings> {
  try {
    await connectToDatabase();
    const { default: SiteSettingsModel } = await import("@/models/SiteSettings");
    let settings = await SiteSettingsModel.findOne({}).lean();

    if (!settings) {
      settings = await SiteSettingsModel.create(DEFAULT_SITE_SETTINGS);
    }

    return normalizeSiteSettings(settings as Partial<SiteSettings>);
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return ensureDefaultSiteSettings();
}
