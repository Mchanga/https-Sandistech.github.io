import { NextRequest } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin, toSafeUser, hashPassword } from "@/lib/auth";
import { created, handleError, ok } from "@/lib/api-helpers";

export async function GET() {
  try {
    await requireAdmin();
    const rows = await db.select().from(users).orderBy(desc(users.createdAt));
    return ok({ users: rows.map(toSafeUser) });
  } catch (err) {
    return handleError(err);
  }
}

const createSchema = z.object({
  fullName: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(["user", "admin"]).default("admin"),
});

/** Admins create other accounts (used for adding fellow administrators). */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { fullName, email, password, role } = createSchema.parse(
      await req.json()
    );
    const lowered = email.toLowerCase();
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, lowered));
    if (existing.length)
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        fullName,
        email: lowered,
        passwordHash,
        role,
        avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(lowered)}`,
      })
      .returning();
    return created({ user: toSafeUser(user) });
  } catch (err) {
    return handleError(err);
  }
}

const schema = z.object({
  id: z.number().int(),
  role: z.enum(["guest", "user", "admin"]),
});

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { id, role } = schema.parse(await req.json());
    if (id === admin.id)
      return Response.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return ok({ user: toSafeUser(user) });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (id === admin.id)
      return Response.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    await db.delete(users).where(eq(users.id, id));
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
