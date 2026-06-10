import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  signToken,
  AUTH_COOKIE,
  toSafeUser,
} from "@/lib/auth";
import { created, handleError } from "@/lib/api-helpers";

const schema = z.object({
  fullName: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, password } = schema.parse(body);

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));
    if (existing.length > 0) {
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        fullName,
        email: email.toLowerCase(),
        passwordHash,
        role: "user",
        avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
      })
      .returning();

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const res = created({ user: toSafeUser(user) });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    return handleError(err);
  }
}
