import { NextRequest } from "next/server";
import { z } from "zod";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { created, handleError, ok } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const conditions = [];
    if (category && category !== "All" && category !== "all")
      conditions.push(eq(businesses.category, category));
    if (search)
      conditions.push(
        or(
          ilike(businesses.name, `%${search}%`),
          ilike(businesses.description, `%${search}%`),
          ilike(businesses.location, `%${search}%`)
        )
      );
    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(businesses)
      .where(where)
      .orderBy(desc(businesses.createdAt));
    return ok({ businesses: rows });
  } catch (err) {
    return handleError(err);
  }
}

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  category: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const data = schema.parse(await req.json());
    const [row] = await db
      .insert(businesses)
      .values({
        ...data,
        email: data.email || null,
        imageUrl: data.imageUrl || null,
      })
      .returning();
    return created({ business: row });
  } catch (err) {
    return handleError(err);
  }
}
