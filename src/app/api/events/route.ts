import { NextRequest } from "next/server";
import { z } from "zod";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { created, handleError, ok } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const conditions = [];
    if (category && category !== "All" && category !== "all")
      conditions.push(eq(events.category, category));
    if (search)
      conditions.push(
        or(
          ilike(events.title, `%${search}%`),
          ilike(events.description, `%${search}%`),
          ilike(events.location, `%${search}%`)
        )
      );
    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(events)
      .where(where)
      .orderBy(asc(events.startDate));
    return ok({ events: rows });
  } catch (err) {
    return handleError(err);
  }
}

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  location: z.string().optional(),
  organizer: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  category: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const data = schema.parse(await req.json());
    const [row] = await db
      .insert(events)
      .values({
        title: data.title,
        description: data.description,
        location: data.location,
        organizer: data.organizer,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        category: data.category,
        imageUrl: data.imageUrl || null,
      })
      .returning();
    return created({ event: row });
  } catch (err) {
    return handleError(err);
  }
}
