import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    return Response.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return Response.json({ success: false, message: "Unable to load user session" }, { status: 500 });
  }
}
