import { NextRequest } from "next/server";
import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts, comments, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { created, handleError, ok } from "@/lib/api-helpers";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    const rows = await db
      .select({
        id: comments.id,
        comment: comments.comment,
        createdAt: comments.createdAt,
        userId: comments.userId,
        userName: users.fullName,
        userAvatar: users.avatar,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, post.id))
      .orderBy(desc(comments.createdAt));

    return ok({ comments: rows });
  } catch (err) {
    return handleError(err);
  }
}

const schema = z.object({ comment: z.string().min(1).max(2000) });

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { slug } = await params;
    const { comment } = schema.parse(await req.json());
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    const [row] = await db
      .insert(comments)
      .values({ userId: user.id, postId: post.id, comment })
      .returning();
    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, post.id));

    return created({
      comment: {
        id: row.id,
        comment: row.comment,
        createdAt: row.createdAt,
        userId: user.id,
        userName: user.fullName,
        userAvatar: user.avatar,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
