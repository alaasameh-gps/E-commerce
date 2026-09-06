import mongoose, { Schema, type Model } from "mongoose";

export type SiteSettingsDocument = {
  storeName: string;
  tagline: string;
  description: string;
  primaryColor: string;
  logoUrl: string;
  contactEmail: string;
  phone: string;
  currency: string;
  supportPhone?: string;
  createdAt: Date;
  updatedAt: Date;
};

const SiteSettingsSchema = new Schema<SiteSettingsDocument>(
  {
    storeName: {
      type: String,
      required: true,
      trim: true,
      default: "متجرنا",
    },
    tagline: {
      type: String,
      required: true,
      trim: true,
      default: "ارفع مستوى كل يوم بمستلزمات عصرية وأنيقة.",
    },
    description: {
      type: String,
      required: true,
      trim: true,
      default: "اكتشف منتجات فاخرة للعمل والسفر والمنزل، ومجموعات مختارة لتجعل حياتك أكثر رفاهية وأناقة.",
    },
    primaryColor: {
      type: String,
      required: true,
      default: "#171717",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    contactEmail: {
      type: String,
      required: true,
      default: "support@morrow.com",
    },
    phone: {
      type: String,
      required: true,
      default: "+966500000000",
    },
    currency: {
      type: String,
      required: true,
      default: "SAR",
    },
    supportPhone: {
      type: String,
      default: "+966500000000",
    },
  },
  { timestamps: true }
);

const SiteSettingsModel =
  (mongoose.models.SiteSettings as Model<SiteSettingsDocument>) ||
  mongoose.model<SiteSettingsDocument>("SiteSettings", SiteSettingsSchema);

export default SiteSettingsModel;
