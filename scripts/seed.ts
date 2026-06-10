import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/db/index";
import {
  users,
  posts,
  businesses,
  events,
  chatRooms,
  notifications,
} from "../src/db/schema";
import { eq } from "drizzle-orm";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function upsertUser(
  fullName: string,
  email: string,
  password: string,
  role: "user" | "admin",
  avatar?: string,
  bio?: string
) {
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  const passwordHash = await bcrypt.hash(password, 10);
  if (existing) {
    const [u] = await db
      .update(users)
      .set({ fullName, passwordHash, role, avatar, bio })
      .where(eq(users.id, existing.id))
      .returning();
    return u;
  }
  const [u] = await db
    .insert(users)
    .values({ fullName, email, passwordHash, role, avatar, bio })
    .returning();
  return u;
}

async function main() {
  console.log("Seeding database…");

  const admin = await upsertUser(
    "SandisTech Admin",
    "admin@sandistech.news",
    "admin123",
    "admin",
    "https://i.pravatar.cc/150?img=12",
    "Editor-in-chief at SandisTech News."
  );
  const author = await upsertUser(
    "Grace Mushi",
    "grace@sandistech.news",
    "user123",
    "user",
    "https://i.pravatar.cc/150?img=45",
    "Reporter covering sports & culture."
  );
  await upsertUser("Demo User", "user@sandistech.news", "user123", "user");

  // Chat rooms
  const existingRooms = await db.select().from(chatRooms);
  if (existingRooms.length === 0) {
    await db.insert(chatRooms).values([
      { name: "General", description: "Community-wide discussion" },
      { name: "News", description: "Talk about the latest headlines" },
      { name: "Business", description: "Connect with entrepreneurs" },
    ]);
  }

  const samplePosts = [
    {
      title: "National Team Secures Dramatic Win in Final Minute",
      type: "news" as const,
      category: "Sports",
      imageUrl:
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80",
      featured: true,
      views: 1820,
      likes: 240,
      content:
        "In a thrilling encounter that kept fans on the edge of their seats, the national team scored a last-gasp winner to clinch the championship.\n\nThe stadium erupted as the final whistle blew, marking one of the most memorable nights in recent sporting history.",
    },
    {
      title: "Watch: Highlights From the Opening Music Festival",
      type: "news" as const,
      category: "Music",
      imageUrl:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      featured: true,
      views: 3120,
      likes: 410,
      content:
        "The annual music festival kicked off with electrifying performances from local and international artists.\n\nCatch the full highlights in the video above.",
    },
    {
      title: "New Scholarship Program Opens for STEM Students",
      type: "news" as const,
      category: "Education",
      imageUrl:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",
      views: 940,
      likes: 88,
      content:
        "A new scholarship initiative aims to support hundreds of students pursuing science, technology, engineering and mathematics degrees.",
    },
    {
      title: "Local Startups Drive Regional Tech Boom",
      type: "business" as const,
      category: "Business Articles",
      imageUrl:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80",
      views: 1260,
      likes: 132,
      content:
        "A wave of homegrown startups is reshaping the local economy, attracting investment and creating thousands of jobs across the region.",
    },
    {
      title: "Market Update: Shilling Holds Steady Amid Global Shifts",
      type: "business" as const,
      category: "Market Updates",
      imageUrl:
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",
      views: 760,
      likes: 54,
      content:
        "Currency markets remained stable this week as analysts weighed the impact of global economic developments on the local economy.",
    },
    {
      title: "Comedy Night Returns to the City Theatre",
      type: "news" as const,
      category: "Comedy",
      imageUrl:
        "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&q=80",
      views: 510,
      likes: 73,
      content:
        "Get ready to laugh — the city's favourite comedy night is back with a star-studded lineup of comedians.",
    },
  ];

  for (const p of samplePosts) {
    const slug = slugify(p.title);
    const [existing] = await db.select().from(posts).where(eq(posts.slug, slug));
    if (existing) continue;
    await db.insert(posts).values({
      ...p,
      slug,
      excerpt: p.content.slice(0, 150),
      authorId: Math.random() > 0.5 ? admin.id : author.id,
    });
  }

  const existingBiz = await db.select().from(businesses);
  if (existingBiz.length === 0) {
    await db.insert(businesses).values([
      {
        name: "Kilimanjaro Coffee House",
        description:
          "Premium locally-sourced coffee and a cosy workspace in the heart of the city.",
        location: "Dar es Salaam",
        phone: "+255700000001",
        whatsapp: "+255700000001",
        email: "hello@kilicoffee.co",
        website: "kilicoffee.co",
        category: "Local Business Listings",
        imageUrl:
          "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80",
      },
      {
        name: "Serengeti Tours & Safaris",
        description: "Unforgettable safari experiences across East Africa.",
        location: "Arusha",
        phone: "+255700000002",
        whatsapp: "+255700000002",
        email: "book@serengetitours.co",
        website: "serengetitours.co",
        category: "Local Business Listings",
        imageUrl:
          "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80",
      },
    ]);
  }

  const existingEvents = await db.select().from(events);
  if (existingEvents.length === 0) {
    const now = Date.now();
    await db.insert(events).values([
      {
        title: "SandisTech Innovation Conference 2026",
        description:
          "A full-day conference bringing together founders, developers and investors.",
        location: "Julius Nyerere Convention Centre, Dar es Salaam",
        organizer: "SandisTech",
        startDate: new Date(now + 7 * 86400000),
        endDate: new Date(now + 7 * 86400000 + 28800000),
        category: "Conferences",
        imageUrl:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
      },
      {
        title: "Live in Concert: Bongo Flava Night",
        description: "An unforgettable night of live music featuring top artists.",
        location: "National Stadium",
        organizer: "City Events Co.",
        startDate: new Date(now + 14 * 86400000),
        category: "Concerts",
        imageUrl:
          "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
      },
      {
        title: "Inter-Region Football Cup Final",
        description: "The grand finale of the regional football championship.",
        location: "Benjamin Mkapa Stadium",
        organizer: "Football Association",
        startDate: new Date(now + 21 * 86400000),
        category: "Sports Events",
        imageUrl:
          "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80",
      },
    ]);
  }

  await db.insert(notifications).values({
    userId: admin.id,
    title: "Welcome to SandisTech News",
    content: "Your admin account is ready. Start publishing content!",
    isRead: false,
  });

  console.log("Seed complete.");
  console.log("Admin login: admin@sandistech.news / admin123");
  console.log("User login:  user@sandistech.news / user123");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
