import { NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { events, eventRsvps } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const eventId = Number(id);
    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (!event) return Response.json({ error: "Event not found" }, { status: 404 });

    const [existing] = await db
      .select()
      .from(eventRsvps)
      .where(and(eq(eventRsvps.userId, user.id), eq(eventRsvps.eventId, eventId)));

    let rsvped: boolean;
    if (existing) {
      await db.delete(eventRsvps).where(eq(eventRsvps.id, existing.id));
      rsvped = false;
    } else {
      await db.insert(eventRsvps).values({ userId: user.id, eventId });
      rsvped = true;
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(eventRsvps)
      .where(eq(eventRsvps.eventId, eventId));

    return ok({ rsvped, rsvpCount: count });
  } catch (err) {
    return handleError(err);
  }
}
