import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, bookmarks } from "@/db/schema";
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
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.postId, post.id)));

    let bookmarked: boolean;
    if (existing) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
      bookmarked = false;
    } else {
      await db.insert(bookmarks).values({ userId: user.id, postId: post.id });
      bookmarked = true;
    }
    return ok({ bookmarked });
  } catch (err) {
    return handleError(err);
  }
}
