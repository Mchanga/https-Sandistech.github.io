import { NextRequest } from "next/server";
import { z } from "zod";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { created, handleError, ok } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";
import { broadcast } from "@/lib/realtime";
import { notifyAll } from "@/lib/notify";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") ?? "recent";
    const featured = searchParams.get("featured");
    const limit = Math.min(Number(searchParams.get("limit") ?? 12), 50);
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const offset = (page - 1) * limit;

    const includeAll = searchParams.get("status") === "all";
    const conditions = [];
    if (!includeAll) conditions.push(eq(posts.status, "published"));
    if (type) conditions.push(eq(posts.type, type as "news" | "business" | "event"));
    if (category && category !== "All" && category !== "all")
      conditions.push(eq(posts.category, category));
    if (featured === "true") conditions.push(eq(posts.featured, true));
    if (search)
      conditions.push(
        or(
          ilike(posts.title, `%${search}%`),
          ilike(posts.content, `%${search}%`),
          ilike(posts.category, `%${search}%`)
        )
      );

    const where = conditions.length ? and(...conditions) : undefined;

    const orderBy =
      sort === "popular"
        ? [desc(posts.views), desc(posts.likes)]
        : sort === "liked"
        ? [desc(posts.likes)]
        : [desc(posts.createdAt)];

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
        featured: posts.featured,
        createdAt: posts.createdAt,
        authorId: posts.authorId,
        authorName: users.fullName,
        authorAvatar: users.avatar,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(where)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(where);

    return ok({ posts: rows, page, limit, total: count, hasMore: offset + rows.length < count });
  } catch (err) {
    return handleError(err);
  }
}

const createSchema = z.object({
  title: z.string().min(3).max(500),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().min(1),
  subCategory: z.string().optional(),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["draft", "pending", "published"]).default("published"),
  type: z.enum(["news", "business", "event"]).default("news"),
  featured: z.boolean().optional(),
  allowComments: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const data = createSchema.parse(body);

    let slug = slugify(data.title);
    const existing = await db.select().from(posts).where(eq(posts.slug, slug));
    if (existing.length) slug = `${slug}-${Date.now().toString(36)}`;

    const [post] = await db
      .insert(posts)
      .values({
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt ?? data.content.slice(0, 160),
        imageUrl: data.imageUrl || null,
        videoUrl: data.videoUrl || null,
        category: data.category,
        subCategory: data.subCategory || null,
        tags: data.tags || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        status: data.status,
        type: data.type,
        featured: data.featured ?? false,
        allowComments: data.allowComments ?? true,
        authorId: admin.id,
      })
      .returning();

    if (post.status === "published") {
      broadcast("new_post", {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        imageUrl: post.imageUrl,
        videoUrl: post.videoUrl,
        category: post.category,
        type: post.type,
        views: post.views,
        likes: post.likes,
        commentsCount: post.commentsCount,
        featured: post.featured,
        createdAt: post.createdAt,
        authorId: post.authorId,
        authorName: admin.fullName,
        authorAvatar: admin.avatar ?? null,
      });
      await notifyAll({
        title: "New article published",
        content: post.title,
        link: `/post/${post.slug}`,
        excludeUserId: admin.id,
      });
    }

    return created({ post });
  } catch (err) {
    return handleError(err);
  }
}
