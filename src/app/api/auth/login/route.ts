import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { signToken } from "@/lib/auth";
import { createAdminAccount, getFallbackUserByEmail } from "@/lib/create-admin";
import { connectToDatabase } from "@/lib/mongodb";
import { userLoginSchema } from "@/lib/validations";
import UserModel from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = userLoginSchema.safeParse(body);

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

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    await createAdminAccount();

    const fallbackUser = getFallbackUserByEmail(normalizedEmail);
    if (fallbackUser) {
      const isPasswordValid = await bcrypt.compare(password, fallbackUser.password);

      if (isPasswordValid) {
        const token = signToken({ id: String(fallbackUser.email), email: fallbackUser.email, role: fallbackUser.role });
        const cookieStore = await cookies();

        cookieStore.set("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });

        return Response.json({
          success: true,
          data: {
            user: {
              _id: String(fallbackUser.email),
              name: fallbackUser.name,
              email: fallbackUser.email,
              role: fallbackUser.role,
            },
          },
        });
      }
    }

    await connectToDatabase();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ id: String(user._id), email: user.email, role: user.role });
    const cookieStore = await cookies();

    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({
      success: true,
      data: {
        user: {
          _id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Login failed",
        errors: error instanceof Error ? { message: error.message } : {},
      },
      { status: 500 }
    );
  }
}
