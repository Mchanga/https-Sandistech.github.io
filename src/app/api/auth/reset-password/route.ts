import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { ok, handleError } from "@/lib/api-helpers";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(6).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const { token, password } = schema.parse(await req.json());

    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));

    if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
      return Response.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, row.userId));
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, row.id));

    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
