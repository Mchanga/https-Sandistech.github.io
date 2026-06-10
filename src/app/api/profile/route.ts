import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser, toSafeUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api-helpers";

const schema = z.object({
  fullName: z.string().min(2).max(255).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  try {
    const current = await requireUser();
    const data = schema.parse(await req.json());
    const [user] = await db
      .update(users)
      .set({
        fullName: data.fullName ?? current.fullName,
        bio: data.bio ?? current.bio,
        avatar: data.avatar || current.avatar,
      })
      .where(eq(users.id, current.id))
      .returning();
    return ok({ user: toSafeUser(user) });
  } catch (err) {
    return handleError(err);
  }
}
