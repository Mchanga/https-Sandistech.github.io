import { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, Number(id)));
    if (!business) return ok({ business: null }, { status: 404 });
    return ok({ business });
  } catch (err) {
    return handleError(err);
  }
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  category: z.string().min(1).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  logo: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = updateSchema.parse(await req.json());
    const [business] = await db
      .update(businesses)
      .set({
        ...data,
        email: data.email || undefined,
        imageUrl: data.imageUrl || undefined,
        logo: data.logo || undefined,
      })
      .where(eq(businesses.id, Number(id)))
      .returning();
    if (!business) return Response.json({ error: "Not found" }, { status: 404 });
    return ok({ business });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.delete(businesses).where(eq(businesses.id, Number(id)));
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
