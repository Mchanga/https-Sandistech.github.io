import "dotenv/config";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "../src/db/index";
import { users, chatRooms } from "../src/db/schema";

/**
 * Reset script.
 *
 * Wipes ALL data and creates exactly two accounts:
 *   - Registered user: paschalmasanja303@gmail.com / Milembe@303
 *   - Administrator:    sandistech@gmail.com       / Milembe@303
 *
 * No sample posts / businesses / events are created — all content is created
 * by an administrator from inside the app and saved to the database.
 */
async function main() {
  console.log("Resetting database…");

  // Wipe every table (TRUNCATE … CASCADE resets identity sequences too).
  await db.execute(sql`
    TRUNCATE TABLE
      reviews,
      notifications,
      chat_messages,
      chat_rooms,
      support_messages,
      feedback,
      event_rsvps,
      events,
      businesses,
      bookmarks,
      likes,
      comments,
      posts,
      users
    RESTART IDENTITY CASCADE
  `);
  console.log("• All tables truncated.");

  const userHash = await bcrypt.hash("Milembe@303", 10);
  const adminHash = await bcrypt.hash("Milembe@303", 10);

  await db.insert(users).values([
    {
      fullName: "Paschal George",
      email: "paschalmasanja303@gmail.com",
      passwordHash: userHash,
      role: "user",
      avatar: "https://i.pravatar.cc/150?u=paschalmasanja303",
      bio: "SandisTech News member.",
    },
    {
      fullName: "SandisTech Admin",
      email: "sandistech@gmail.com",
      passwordHash: adminHash,
      role: "admin",
      avatar: "https://i.pravatar.cc/150?u=sandistech-admin",
      bio: "Administrator of SandisTech News.",
    },
  ]);
  console.log("• Created registered user + administrator.");

  // Community chat rooms (messages are created live by users).
  await db.insert(chatRooms).values([
    { name: "General", description: "Community-wide discussion" },
    { name: "News", description: "Talk about the latest headlines" },
    { name: "Business", description: "Connect with entrepreneurs" },
  ]);
  console.log("• Created community chat rooms.");

  console.log("\nDone. Logins:");
  console.log("  user:  paschalmasanja303@gmail.com / Milembe@303");
  console.log("  admin: sandistech@gmail.com / Milembe@303");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
