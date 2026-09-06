import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { normalizeSiteSettings, type SiteSettings } from "@/lib/site-settings";
import SiteSettingsModel from "@/models/SiteSettings";

const allowedMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
]);

const allowedExtensions = new Set(["png", "jpg", "jpeg", "gif", "webp"]);
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
      return Response.json({ success: false, message: "No logo file was provided." }, { status: 400 });
    }

    const mimeType = file.type || "";
    const fileName = file.name || "logo";
    const extension = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() ?? "" : "";

    if (!allowedMimeTypes.has(mimeType) || !extension || !allowedExtensions.has(extension)) {
      return Response.json({ success: false, message: "Only PNG, JPG, JPEG, GIF, and WEBP image files are allowed." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ success: false, message: "Logo image must be smaller than 2MB." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    const destination = path.join(uploadDir, safeName);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(destination, bytes);

    const publicUrl = `/uploads/${safeName}`;

    await connectToDatabase();
    const settings = await SiteSettingsModel.findOneAndUpdate(
      {},
      { $set: { logoUrl: publicUrl } },
      { new: true, upsert: true, runValidators: true }
    );

    return Response.json({
      success: true,
      data: normalizeSiteSettings(settings as Partial<SiteSettings> | null),
      logoUrl: publicUrl,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    return Response.json(
      {
        success: false,
        message: "Failed to upload logo",
        errors: error instanceof Error ? { message: error.message } : {},
      },
      { status: 500 }
    );
  }
}
