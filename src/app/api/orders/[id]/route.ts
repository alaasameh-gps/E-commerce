import { type NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    await connectToDatabase();
    const order = await OrderModel.findById(id).lean();

    if (!order) {
      return Response.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (user.role !== "admin" && String(order.user) !== user.id) {
      return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    return Response.json({ success: true, data: order });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error && error.message === "Unauthorized" ? "Unauthorized" : "Failed to fetch order",
        errors: error instanceof Error ? { message: error.message } : {},
      },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    if (!user || user.role !== "admin") {
      return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const order = await OrderModel.findByIdAndUpdate(
      id,
      {
        orderStatus: body.orderStatus,
        paymentStatus: body.paymentStatus,
      },
      { new: true }
    );

    if (!order) {
      return Response.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return Response.json({ success: true, data: order });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error && error.message === "Unauthorized" ? "Unauthorized" : "Failed to update order",
        errors: error instanceof Error ? { message: error.message } : {},
      },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
