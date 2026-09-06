import { cookies } from "next/headers";

import { signToken } from "@/lib/auth";
import { registerFallbackUser } from "@/lib/create-admin";
import { connectToDatabase } from "@/lib/mongodb";
import { userRegisterSchema } from "@/lib/validations";
import UserModel from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = userRegisterSchema.safeParse(body);

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

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    try {
      await connectToDatabase();
      const existingUser = await UserModel.findOne({ email: normalizedEmail });

      if (existingUser) {
        return Response.json({ success: false, message: "User already exists" }, { status: 409 });
      }

      const user = await UserModel.create({ name, email: normalizedEmail, password, role: "user" });
      const token = signToken({ id: String(user._id), email: user.email, role: user.role });
      const cookieStore = await cookies();

      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return Response.json(
        {
          success: true,
          data: {
            user: {
              _id: String(user._id),
              name: user.name,
              email: user.email,
              role: user.role,
            },
          },
        },
        { status: 201 }
      );
    } catch {
      const fallbackUser = await registerFallbackUser({ name, email: normalizedEmail, password, role: "user" });
      const token = signToken({ id: String(fallbackUser.email), email: fallbackUser.email, role: fallbackUser.role });
      const cookieStore = await cookies();

      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return Response.json(
        {
          success: true,
          data: {
            user: {
              _id: String(fallbackUser.email),
              name: fallbackUser.name,
              email: fallbackUser.email,
              role: fallbackUser.role,
            },
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Registration failed",
        errors: error instanceof Error ? { message: error.message } : {},
      },
      { status: 500 }
    );
  }
}
