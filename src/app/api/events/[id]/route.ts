import { NextRequest } from "next/server";
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { events, eventRsvps } from "@/db/schema";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { handleError, ok } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  organizer: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().min(1).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = updateSchema.parse(await req.json());
    const [event] = await db
      .update(events)
      .set({
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        imageUrl: data.imageUrl || undefined,
      })
      .where(eq(events.id, Number(id)))
      .returning();
    if (!event) return Response.json({ error: "Not found" }, { status: 404 });
    return ok({ event });
  } catch (err) {
    return handleError(err);
  }
}

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
