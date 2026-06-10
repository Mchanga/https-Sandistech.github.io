import { NextRequest } from "next/server";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api-helpers";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    const unread = rows.filter((r) => !r.isRead).length;
    return ok({ notifications: rows, unread });
  } catch (err) {
    return handleError(err);
  }
}

const schema = z.object({ id: z.number().int().optional(), all: z.boolean().optional() });

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const { id, all } = schema.parse(await req.json());
    if (all) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, user.id));
    } else if (id) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));
    }
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
