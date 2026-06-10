import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookmarks, posts, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api-helpers";

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        category: posts.category,
        type: posts.type,
        views: posts.views,
        likes: posts.likes,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        authorName: users.fullName,
        authorAvatar: users.avatar,
      })
      .from(bookmarks)
      .innerJoin(posts, eq(bookmarks.postId, posts.id))
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(bookmarks.userId, user.id))
      .orderBy(desc(bookmarks.createdAt));
    return ok({ posts: rows });
  } catch (err) {
    return handleError(err);
  }
}
