import { NextRequest } from "next/server";
import { z } from "zod";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { chatRooms } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { created, handleError, ok } from "@/lib/api-helpers";

export async function GET() {
  try {
    let rooms = await db.select().from(chatRooms).orderBy(asc(chatRooms.id));
    if (rooms.length === 0) {
      rooms = await db
        .insert(chatRooms)
        .values([
          { name: "General", description: "Community-wide discussion" },
          { name: "News", description: "Talk about the latest headlines" },
          { name: "Business", description: "Connect with entrepreneurs" },
        ])
        .returning();
    }
    return ok({ rooms });
  } catch (err) {
    return handleError(err);
  }
}

const schema = z.object({ name: z.string().min(1), description: z.string().optional() });

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const data = schema.parse(await req.json());
    const [room] = await db.insert(chatRooms).values(data).returning();
    return created({ room });
  } catch (err) {
    return handleError(err);
  }
}
