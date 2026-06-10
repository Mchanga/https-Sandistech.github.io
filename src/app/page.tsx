"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Mic, Flame, TrendingUp, ArrowRight } from "lucide-react";
import { PostHero, PostRow } from "@/components/PostCard";
import { CardSkeleton, EmptyState } from "@/components/ui/Common";
import { useStore } from "@/store/useStore";
import { getJSON } from "@/lib/client";
import type { PostListItem } from "@/lib/types";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function HomePage() {
  const { toggleSearch, user } = useStore();
  const [recent, setRecent] = useState<PostListItem[] | null>(null);
  const [trending, setTrending] = useState<PostListItem[] | null>(null);

  useEffect(() => {
    getJSON<{ posts: PostListItem[] }>("/api/posts?sort=recent&limit=6")
      .then((d) => setRecent(d.posts))
      .catch(() => setRecent([]));
    getJSON<{ posts: PostListItem[] }>("/api/posts?sort=popular&limit=5")
      .then((d) => setTrending(d.posts))
      .catch(() => setTrending([]));

    const onNew = () => {
      getJSON<{ posts: PostListItem[] }>("/api/posts?sort=recent&limit=6")
        .then((d) => setRecent(d.posts))
        .catch(() => {});
    };
    window.addEventListener("sandistech:new_post", onNew);
    return () => window.removeEventListener("sandistech:new_post", onNew);
  }, []);

  const hero = trending?.[0];
  const trendingRest = trending?.slice(1) ?? [];

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted">{greeting()},</p>
        <h1 className="text-2xl font-extrabold leading-tight">
          Stay updated with{" "}
          <span className="text-brand-600">SandisTech News</span>
          {user ? `, ${user.fullName.split(" ")[0]}` : ""}
        </h1>
      </div>

      {/* Search */}
      <button
        onClick={() => toggleSearch(true)}
        className="card-soft flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-muted"
      >
        <Search className="h-5 w-5" />
        <span className="flex-1">Search news, business, events…</span>
        <Mic className="h-5 w-5 text-brand-600" />
      </button>

      {/* Trending Now */}
      <section>
        <SectionTitle
          title="Trending Now"
          emoji={<Flame className="h-4 w-4 text-orange-500" />}
          href="/news?sort=popular"
        />
        {trending === null ? (
          <CardSkeleton />
        ) : hero ? (
          <div className="space-y-3">
            <PostHero post={hero} />
            {trendingRest.length > 0 && (
              <div className="space-y-2">
                {trendingRest.map((p) => (
                  <PostRow key={p.id} post={p} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title="Nothing trending yet"
            description="Trending stories will appear here."
            icon={<TrendingUp className="h-8 w-8" />}
          />
        )}
      </section>

      {/* Recent News */}
      <section>
        <SectionTitle title="Recent News" href="/news" />
        {recent === null ? (
          <div className="space-y-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : recent.length === 0 ? (
          <EmptyState title="No posts yet" description="Check back soon." />
        ) : (
          <div className="space-y-2">
            {recent.map((p) => (
              <PostRow key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionTitle({
  title,
  emoji,
  href,
}: {
  title: string;
  emoji?: React.ReactNode;
  href: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-1.5 text-lg font-extrabold tracking-tight">
        {title} {emoji}
      </h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600"
      >
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
