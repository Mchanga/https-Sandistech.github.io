import { NextRequest } from "next/server";
import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { businesses, reviews, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { created, handleError, ok } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const id = Number((await params).id);
    const [biz] = await db.select().from(businesses).where(eq(businesses.id, id));
    if (!biz) return Response.json({ error: "Not found" }, { status: 404 });

    const rows = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userId: reviews.userId,
        userName: users.fullName,
        userAvatar: users.avatar,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.businessId, id))
      .orderBy(desc(reviews.createdAt));

    return ok({ reviews: rows, rating: biz.rating, ratingCount: biz.reviews });
  } catch (err) {
    return handleError(err);
  }
}

const schema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const id = Number((await params).id);
    const [biz] = await db.select().from(businesses).where(eq(businesses.id, id));
    if (!biz) return Response.json({ error: "Not found" }, { status: 404 });

    const { rating, comment } = schema.parse(await req.json());

    const [existing] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.businessId, id), eq(reviews.userId, user.id)));

    if (existing) {
      await db
        .update(reviews)
        .set({ rating, comment: comment || null })
        .where(eq(reviews.id, existing.id));
    } else {
      await db
        .insert(reviews)
        .values({ businessId: id, userId: user.id, rating, comment: comment || null });
    }

    const [agg] = await db
      .select({
        avg: sql<number>`coalesce(avg(${reviews.rating}), 0)`,
        cnt: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.businessId, id));

    await db
      .update(businesses)
      .set({ rating: Number(agg.avg), reviews: agg.cnt })
      .where(eq(businesses.id, id));

    return created({ rating: Number(agg.avg), ratingCount: agg.cnt });
  } catch (err) {
    return handleError(err);
  }
}
