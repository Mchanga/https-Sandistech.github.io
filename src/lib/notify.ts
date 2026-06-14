import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { broadcast } from "@/lib/realtime";

/**
 * Create an in-app notification for every user (optionally excluding the
 * author) and broadcast a realtime "notification" event so connected clients
 * refresh their unread badge instantly.
 */
export async function notifyAll(opts: {
  title: string;
  content?: string;
  link?: string;
  excludeUserId?: number;
}) {
  const rows = await db.select({ id: users.id }).from(users);
  const targets = rows.filter((r) => r.id !== opts.excludeUserId);
  if (targets.length) {
    await db.insert(notifications).values(
      targets.map((t) => ({
        userId: t.id,
        title: opts.title,
        content: opts.content ?? null,
        link: opts.link ?? null,
      }))
    );
  }
  broadcast("notification", { title: opts.title, link: opts.link ?? null });
}
