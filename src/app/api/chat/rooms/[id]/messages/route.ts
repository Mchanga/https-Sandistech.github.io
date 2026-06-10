import { NextRequest } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await requireUser();
    const { id } = await params;
    const roomId = Number(id);
    const rows = await db
      .select({
        id: chatMessages.id,
        roomId: chatMessages.roomId,
        message: chatMessages.message,
        createdAt: chatMessages.createdAt,
        userId: chatMessages.userId,
        userName: users.fullName,
        userAvatar: users.avatar,
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(100);
    return ok({ messages: rows });
  } catch (err) {
    return handleError(err);
  }
}
