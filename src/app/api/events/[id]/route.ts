import { NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { events, eventRsvps } from "@/db/schema";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { handleError, ok } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const eventId = Number(id);
    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (!event) return Response.json({ error: "Event not found" }, { status: 404 });

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(eventRsvps)
      .where(eq(eventRsvps.eventId, eventId));

    const user = await getCurrentUser();
    let rsvped = false;
    if (user) {
      const [r] = await db
        .select()
        .from(eventRsvps)
        .where(
          and(eq(eventRsvps.userId, user.id), eq(eventRsvps.eventId, eventId))
        );
      rsvped = !!r;
    }

    return ok({ event, rsvpCount: count, rsvped });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.delete(events).where(eq(events.id, Number(id)));
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
