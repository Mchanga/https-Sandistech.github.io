import { NextRequest } from "next/server";
import { desc, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { posts, businesses, events } from "@/db/schema";
import { handleError, ok } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (!q) return ok({ posts: [], businesses: [], events: [] });
    const like = `%${q}%`;

    const [postRows, businessRows, eventRows] = await Promise.all([
      db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          category: posts.category,
          type: posts.type,
          imageUrl: posts.imageUrl,
        })
        .from(posts)
        .where(or(ilike(posts.title, like), ilike(posts.content, like)))
        .orderBy(desc(posts.createdAt))
        .limit(10),
      db
        .select()
        .from(businesses)
        .where(or(ilike(businesses.name, like), ilike(businesses.description, like)))
        .limit(10),
      db
        .select()
        .from(events)
        .where(or(ilike(events.title, like), ilike(events.description, like)))
        .limit(10),
    ]);

    return ok({ posts: postRows, businesses: businessRows, events: eventRows });
  } catch (err) {
    return handleError(err);
  }
}
