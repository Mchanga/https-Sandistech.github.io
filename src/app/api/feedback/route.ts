import { NextRequest } from "next/server";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { feedback } from "@/db/schema";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { created, handleError, ok } from "@/lib/api-helpers";

const schema = z.object({
  name: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5),
  message: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = schema.parse(await req.json());
    const [row] = await db
      .insert(feedback)
      .values({
        userId: user?.id ?? null,
        name: data.name ?? user?.fullName ?? "Anonymous",
        rating: data.rating,
        message: data.message,
      })
      .returning();
    return created({ feedback: row });
  } catch (err) {
    return handleError(err);
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const rows = await db.select().from(feedback).orderBy(desc(feedback.createdAt));
    return ok({ feedback: rows });
  } catch (err) {
    return handleError(err);
  }
}
