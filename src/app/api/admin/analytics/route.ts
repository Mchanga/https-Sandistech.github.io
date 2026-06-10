import { sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import {
  users,
  posts,
  businesses,
  events,
  comments,
  likes,
  feedback,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok } from "@/lib/api-helpers";

async function count(table: PgTable) {
  const [{ c }] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(table);
  return c;
}

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalPosts,
      totalBusinesses,
      totalEvents,
      totalComments,
      totalLikes,
      totalFeedback,
    ] = await Promise.all([
      count(users),
      count(posts),
      count(businesses),
      count(events),
      count(comments),
      count(likes),
      count(feedback),
    ]);

    const [{ totalViews }] = await db
      .select({ totalViews: sql<number>`coalesce(sum(${posts.views}), 0)::int` })
      .from(posts);

    const byType = await db
      .select({
        type: posts.type,
        count: sql<number>`count(*)::int`,
        views: sql<number>`coalesce(sum(${posts.views}),0)::int`,
      })
      .from(posts)
      .groupBy(posts.type);

    const topPosts = await db
      .select({
        title: posts.title,
        slug: posts.slug,
        views: posts.views,
        likes: posts.likes,
      })
      .from(posts)
      .orderBy(sql`${posts.views} desc`)
      .limit(5);

    return ok({
      totals: {
        users: totalUsers,
        posts: totalPosts,
        businesses: totalBusinesses,
        events: totalEvents,
        comments: totalComments,
        likes: totalLikes,
        feedback: totalFeedback,
        views: totalViews,
      },
      byType,
      topPosts,
    });
  } catch (err) {
    return handleError(err);
  }
}
