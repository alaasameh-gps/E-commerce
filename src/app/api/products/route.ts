import { type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { productSchema } from "@/lib/validations";
import { mockProducts } from "@/lib/mock-data";
import ProductModel from "@/models/Product";
import { slugify } from "@/lib/utils";

function getPagedProducts(items: typeof mockProducts, page: number, limit: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;
  const paged = items.slice(start, start + limit);

  return {
    products: paged,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 12);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = Number(searchParams.get("minPrice") || 0);
    const maxPrice = Number(searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER);
    const sort = searchParams.get("sort") || "featured";

    try {
      await connectToDatabase();
      const query: Record<string, unknown> = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
        ];
      }

      if (category) {
        query.category = category;
      }

      if (minPrice || maxPrice !== Number.MAX_SAFE_INTEGER) {
        query.price = {
          $gte: minPrice,
          $lte: maxPrice,
        };
      }

      let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };

      switch (sort) {
        case "price-asc":
          sortQuery = { price: 1 };
          break;
        case "price-desc":
          sortQuery = { price: -1 };
          break;
        case "rating":
          sortQuery = { rating: -1 };
          break;
        case "newest":
          sortQuery = { createdAt: -1 };
          break;
        default:
          sortQuery = { featured: -1, createdAt: -1 };
      }

      const [products, total] = await Promise.all([
        ProductModel.find(query).sort(sortQuery).skip((page - 1) * limit).limit(limit).lean(),
        ProductModel.countDocuments(query),
      ]);

      return Response.json({
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
      });
    } catch {
      const filtered = mockProducts.filter((product) => {
        const matchesSearch = !search || `${product.name} ${product.description} ${product.brand}`.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !category || product.category === category;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
      });

      const sorted = [...filtered].sort((a, b) => {
        switch (sort) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "rating":
            return (b.rating ?? 0) - (a.rating ?? 0);
          case "newest":
            return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          default:
            return Number(b.featured) - Number(a.featured);
        }
      });

      const result = getPagedProducts(sorted, page, limit);

      return Response.json({
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to fetch products",
        errors: error instanceof Error ? { message: error.message } : {},
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

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

    const productPayload = parsed.data;
    const slug = productPayload.slug || slugify(productPayload.name);

    try {
      await connectToDatabase();
      const product = await ProductModel.create({
        ...productPayload,
        slug,
      });

      return Response.json({ success: true, data: product }, { status: 201 });
    } catch {
      const product = {
        ...productPayload,
        _id: `prod-${Date.now()}`,
        slug,
      };

      mockProducts.unshift(product as typeof mockProducts[number]);
      return Response.json({ success: true, data: product }, { status: 201 });
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to create product",
        errors: error instanceof Error ? { message: error.message } : {},
      },
      { status: 500 }
    );
  }
}
