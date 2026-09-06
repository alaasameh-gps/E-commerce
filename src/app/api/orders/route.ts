import { type NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { orderSchema } from "@/lib/validations";
import OrderModel from "@/models/Order";

function getFallbackOrders() {
  const globalRef = globalThis as typeof globalThis & {
    __morrowOrders?: Array<Record<string, unknown>>;
  };

  if (!globalRef.__morrowOrders) {
    globalRef.__morrowOrders = [];
  }

  return globalRef.__morrowOrders;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") || 20);
    const page = Number(searchParams.get("page") || 1);

    try {
      await connectToDatabase();
      const query = user.role === "admin" ? {} : { user: user.id };

      const [orders, total] = await Promise.all([
        OrderModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        OrderModel.countDocuments(query),
      ]);

      const fallbackOrders = getFallbackOrders();
      const merged = [...(orders as unknown[]), ...fallbackOrders].slice(0, limit);

      return Response.json({
        success: true,
        data: {
          orders: merged,
          pagination: {
            page,
            limit,
            total: Math.max(total, fallbackOrders.length),
            totalPages: Math.ceil(Math.max(total, fallbackOrders.length) / limit) || 1,
          },
        },
      });
    } catch {
      const fallbackOrders = getFallbackOrders();
      return Response.json({
        success: true,
        data: {
          orders: fallbackOrders,
          pagination: {
            page,
            limit,
            total: fallbackOrders.length,
            totalPages: Math.ceil(fallbackOrders.length / limit) || 1,
          },
        },
      });
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error && error.message === "Unauthorized" ? "Unauthorized" : "Failed to fetch orders",
        errors: error instanceof Error ? { message: error.message } : {},
      },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);

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

    const payload = parsed.data;

    try {
      await connectToDatabase();
      const order = await OrderModel.create({
        user: user.id,
        items: payload.items,
        shippingAddress: payload.shippingAddress,
        subtotal: payload.subtotal,
        shipping: payload.shipping,
        total: payload.total,
        paymentStatus: payload.paymentStatus || "pending",
        orderStatus: payload.orderStatus || "pending",
      });

      return Response.json({ success: true, data: order }, { status: 201 });
    } catch {
      const fallbackOrders = getFallbackOrders();
      const order = {
        _id: `fallback-${Date.now()}`,
        user: user.id,
        items: payload.items,
        shippingAddress: payload.shippingAddress,
        subtotal: payload.subtotal,
        shipping: payload.shipping,
        total: payload.total,
        paymentStatus: payload.paymentStatus || "paid",
        orderStatus: payload.orderStatus || "pending",
        createdAt: new Date().toISOString(),
      };
      fallbackOrders.unshift(order);
      return Response.json({ success: true, data: order }, { status: 201 });
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error && error.message === "Unauthorized" ? "Unauthorized" : "Failed to create order",
        errors: error instanceof Error ? { message: error.message } : {},
      },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
