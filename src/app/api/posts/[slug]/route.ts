import { NextRequest } from "next/server";
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts, users, comments, likes, bookmarks, reviews } from "@/db/schema";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { handleError, ok } from "@/lib/api-helpers";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const [post] = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        excerpt: posts.excerpt,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        category: posts.category,
        type: posts.type,
        views: posts.views,
        likes: posts.likes,
        commentsCount: posts.commentsCount,
        rating: posts.rating,
        ratingCount: posts.ratingCount,
        allowComments: posts.allowComments,
        featured: posts.featured,
        createdAt: posts.createdAt,
        authorId: posts.authorId,
        authorName: users.fullName,
        authorAvatar: users.avatar,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.slug, slug));

    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, post.id));

    const user = await getCurrentUser();
    let liked = false;
    let bookmarked = false;
    let myReview: { rating: number; comment: string | null } | null = null;
    if (user) {
      const [r] = await db
        .select({ rating: reviews.rating, comment: reviews.comment })
        .from(reviews)
        .where(and(eq(reviews.userId, user.id), eq(reviews.postId, post.id)));
      myReview = r ?? null;
      const [l] = await db
        .select()
        .from(likes)
        .where(sql`${likes.userId} = ${user.id} AND ${likes.postId} = ${post.id}`);
      const [b] = await db
        .select()
        .from(bookmarks)
        .where(
          sql`${bookmarks.userId} = ${user.id} AND ${bookmarks.postId} = ${post.id}`
        );
      liked = !!l;
      bookmarked = !!b;
    }

    return ok({ post: { ...post, views: post.views + 1 }, liked, bookmarked, myReview });
  } catch (err) {
    return handleError(err);
  }
}

const updateSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().min(1).optional(),
  type: z.enum(["news", "business", "event"]).optional(),
  featured: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { slug } = await params;
    const data = updateSchema.parse(await req.json());
    const [post] = await db
      .update(posts)
      .set({
        ...data,
        imageUrl: data.imageUrl || undefined,
        videoUrl: data.videoUrl || undefined,
      })
      .where(eq(posts.slug, slug))
      .returning();
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });
    return ok({ post });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { slug } = await params;
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });
    await db.delete(comments).where(eq(comments.postId, post.id));
    await db.delete(likes).where(eq(likes.postId, post.id));
    await db.delete(bookmarks).where(eq(bookmarks.postId, post.id));
    await db.delete(posts).where(eq(posts.id, post.id));
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
