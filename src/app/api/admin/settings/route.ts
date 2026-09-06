import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { DEFAULT_SITE_SETTINGS, isValidLogoUrl, normalizeSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { siteSettingsSchema } from "@/lib/validations";
import SiteSettingsModel from "@/models/SiteSettings";

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await SiteSettingsModel.findOne({}).lean();
    const normalized = normalizeSiteSettings(settings as unknown as Partial<SiteSettings> | null);

    if (settings && settings.logoUrl && !isValidLogoUrl(String(settings.logoUrl))) {
      await SiteSettingsModel.findOneAndUpdate({}, { $set: { logoUrl: "" } }, { upsert: true, runValidators: true });
    }

    return Response.json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error && error.message === "Unauthorized" ? "Unauthorized" : "Failed to fetch site settings",
      },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const normalizedBody = {
      ...body,
      logoUrl: typeof body.logoUrl === "string" && !isValidLogoUrl(body.logoUrl) ? "" : body.logoUrl ?? "",
      phone: body.phone ?? body.supportPhone ?? DEFAULT_SITE_SETTINGS.phone,
      currency: body.currency ?? DEFAULT_SITE_SETTINGS.currency,
      supportPhone: body.supportPhone ?? body.phone ?? DEFAULT_SITE_SETTINGS.supportPhone,
    };
    const parsed = siteSettingsSchema.safeParse(normalizedBody);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const settings = await SiteSettingsModel.findOneAndUpdate(
      {},
      { $set: parsed.data },
      { new: true, upsert: true, runValidators: true }
    );

    return Response.json({ success: true, data: normalizeSiteSettings(settings as unknown as Partial<SiteSettings> | null) });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error && error.message === "Unauthorized" ? "Unauthorized" : "Failed to update site settings",
      },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
