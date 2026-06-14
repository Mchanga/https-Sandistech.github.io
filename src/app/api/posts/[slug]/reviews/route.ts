import { NextRequest } from "next/server";
import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts, reviews, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { created, handleError, ok } from "@/lib/api-helpers";

type Params = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
  return post;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

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
      .where(eq(reviews.postId, post.id))
      .orderBy(desc(reviews.createdAt));

    return ok({
      reviews: rows,
      rating: post.rating,
      ratingCount: post.ratingCount,
    });
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
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    const { rating, comment } = schema.parse(await req.json());

    // One review per user per post (upsert).
    const [existing] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.postId, post.id), eq(reviews.userId, user.id)));

    if (existing) {
      await db
        .update(reviews)
        .set({ rating, comment: comment || null })
        .where(eq(reviews.id, existing.id));
    } else {
      await db
        .insert(reviews)
        .values({ postId: post.id, userId: user.id, rating, comment: comment || null });
    }

    // Recompute aggregate rating from all reviews.
    const [agg] = await db
      .select({
        avg: sql<number>`coalesce(avg(${reviews.rating}), 0)`,
        cnt: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.postId, post.id));

    await db
      .update(posts)
      .set({ rating: Number(agg.avg), ratingCount: agg.cnt })
      .where(eq(posts.id, post.id));

    return created({ rating: Number(agg.avg), ratingCount: agg.cnt });
  } catch (err) {
    return handleError(err);
  }
}
