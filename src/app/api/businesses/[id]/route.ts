import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { handleError, ok } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
