import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/User";

const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@morrow.com").toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

type FallbackUser = {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
};

function getFallbackUsers() {
  const globalRef = globalThis as typeof globalThis & {
    __morrowFallbackUsers?: Record<string, FallbackUser>;
  };

  if (!globalRef.__morrowFallbackUsers) {
    globalRef.__morrowFallbackUsers = {};
  }

  return globalRef.__morrowFallbackUsers;
}

export function getFallbackUserByEmail(email: string) {
  return getFallbackUsers()[email.toLowerCase()] ?? null;
}

export async function ensureDefaultAdmin() {
  return createAdminAccount();
}

export async function registerFallbackUser(input: { name: string; email: string; password: string; role?: "user" | "admin" }) {
  const email = input.email.toLowerCase();
  const users = getFallbackUsers();

  if (users[email]) {
    return users[email];
  }

  users[email] = {
    name: input.name,
    email,
    password: await bcrypt.hash(input.password, 10),
    role: input.role ?? "user",
  };

  return users[email];
}

export async function createAdminAccount(options?: {
  email?: string;
  password?: string;
  name?: string;
}) {
  const email = (options?.email || DEFAULT_ADMIN_EMAIL).toLowerCase();
  const password = options?.password || DEFAULT_ADMIN_PASSWORD;
  const name = options?.name || DEFAULT_ADMIN_NAME;

  try {
    await connectToDatabase();

    const existing = await UserModel.findOne({ email });

    if (existing) {
      if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();
      }

      return {
        created: false,
        user: {
          _id: String(existing._id),
          email: existing.email,
          role: existing.role,
        },
      };
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      role: "admin",
    });

    return {
      created: true,
      user: {
        _id: String(user._id),
        email: user.email,
        role: user.role,
      },
    };
  } catch {
    const users = getFallbackUsers();
    const user = users[email];

    if (user && user.role === "admin") {
      return {
        created: false,
        fallback: true,
        user: { _id: "fallback-admin", email: user.email, role: user.role },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users[email] = {
      name,
      email,
      password: hashedPassword,
      role: "admin",
    };

    return {
      created: true,
      fallback: true,
      user: { _id: "fallback-admin", email, role: "admin" },
    };
  }
}

if (require.main === module) {
  createAdminAccount()
    .then((result) => {
      console.log("Admin setup complete:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Admin setup failed:", error);
      process.exit(1);
    });
}
