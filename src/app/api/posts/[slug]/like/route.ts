import { NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts, likes } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api-helpers";

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { slug } = await params;
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    const [existing] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, user.id), eq(likes.postId, post.id)));

    let liked: boolean;
    if (existing) {
      await db.delete(likes).where(eq(likes.id, existing.id));
      await db
        .update(posts)
        .set({ likes: sql`GREATEST(${posts.likes} - 1, 0)` })
        .where(eq(posts.id, post.id));
      liked = false;
    } else {
      await db.insert(likes).values({ userId: user.id, postId: post.id });
      await db
        .update(posts)
        .set({ likes: sql`${posts.likes} + 1` })
        .where(eq(posts.id, post.id));
      liked = true;
    }

    const [updated] = await db
      .select({ likes: posts.likes })
      .from(posts)
      .where(eq(posts.id, post.id));
    return ok({ liked, likes: updated.likes });
  } catch (err) {
    return handleError(err);
  }
}
