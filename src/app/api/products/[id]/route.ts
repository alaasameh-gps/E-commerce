import { type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { mockProducts } from "@/lib/mock-data";
import { slugify } from "@/lib/utils";
import { productUpdateSchema } from "@/lib/validations";
import ProductModel from "@/models/Product";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    try {
      await connectToDatabase();
      const product = await ProductModel.findOne({
        $or: [{ _id: id }, { slug: id }],
      }).lean();

      if (!product) {
        return Response.json({ success: false, message: "Product not found" }, { status: 404 });
      }

      return Response.json({ success: true, data: product });
    } catch {
      const product = mockProducts.find((item) => item._id === id || item.slug === id);

      if (!product) {
        return Response.json({ success: false, message: "Product not found" }, { status: 404 });
      }

      return Response.json({ success: true, data: product });
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to fetch product",
        errors: error instanceof Error ? { message: error.message } : {},
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);

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

    const updateData = parsed.data;
    if (updateData.name) {
      updateData.slug = slugify(updateData.name);
    }

    try {
      await connectToDatabase();
      const product = await ProductModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

      if (!product) {
        return Response.json({ success: false, message: "Product not found" }, { status: 404 });
      }

      return Response.json({ success: true, data: product });
    } catch {
      const productIndex = mockProducts.findIndex((item) => item._id === id || item.slug === id);
      if (productIndex === -1) {
        return Response.json({ success: false, message: "Product not found" }, { status: 404 });
      }

      mockProducts[productIndex] = { ...mockProducts[productIndex], ...updateData };
      return Response.json({ success: true, data: mockProducts[productIndex] });
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to update product",
        errors: error instanceof Error ? { message: error.message } : {},
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    try {
      await connectToDatabase();
      const deletedProduct = await ProductModel.findByIdAndDelete(id);

      if (!deletedProduct) {
        return Response.json({ success: false, message: "Product not found" }, { status: 404 });
      }

      return Response.json({ success: true, data: deletedProduct });
    } catch {
      const productIndex = mockProducts.findIndex((item) => item._id === id || item.slug === id);
      if (productIndex === -1) {
        return Response.json({ success: false, message: "Product not found" }, { status: 404 });
      }

      const [removed] = mockProducts.splice(productIndex, 1);
      return Response.json({ success: true, data: removed });
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to delete product",
        errors: error instanceof Error ? { message: error.message } : {},
      },
      { status: 500 }
    );
  }
}
