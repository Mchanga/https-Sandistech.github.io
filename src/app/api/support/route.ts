import { NextRequest } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { supportMessages } from "@/db/schema";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { created, handleError, ok } from "@/lib/api-helpers";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1).max(255),
  message: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = schema.parse(await req.json());
    const [row] = await db
      .insert(supportMessages)
      .values({
        userId: user?.id ?? null,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: "open",
      })
      .returning();
    return created({ ticket: row });
  } catch (err) {
    return handleError(err);
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const rows = await db
      .select()
      .from(supportMessages)
      .orderBy(desc(supportMessages.createdAt));
    return ok({ tickets: rows });
  } catch (err) {
    return handleError(err);
  }
}

const replySchema = z.object({
  id: z.number().int(),
  reply: z.string().min(1),
  status: z.enum(["open", "in_progress", "closed"]).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const data = replySchema.parse(await req.json());
    const [row] = await db
      .update(supportMessages)
      .set({ reply: data.reply, status: data.status ?? "closed" })
      .where(eq(supportMessages.id, data.id))
      .returning();
    return ok({ ticket: row });
  } catch (err) {
    return handleError(err);
  }
}
