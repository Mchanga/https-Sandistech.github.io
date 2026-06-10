"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Mic, TrendingUp, Sparkles, Flame, ArrowRight } from "lucide-react";
import PostCard from "@/components/PostCard";
import { CardSkeleton, SectionHeader, EmptyState } from "@/components/ui/Common";
import { useStore } from "@/store/useStore";
import { getJSON } from "@/lib/client";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import type { PostListItem } from "@/lib/types";

export default function HomePage() {
  const { toggleSearch } = useStore();
  const [recent, setRecent] = useState<PostListItem[] | null>(null);
  const [trending, setTrending] = useState<PostListItem[] | null>(null);
  const [featured, setFeatured] = useState<PostListItem[] | null>(null);

  useEffect(() => {
    getJSON<{ posts: PostListItem[] }>("/api/posts?sort=recent&limit=6")
      .then((d) => setRecent(d.posts))
      .catch(() => setRecent([]));
    getJSON<{ posts: PostListItem[] }>("/api/posts?sort=popular&limit=6")
      .then((d) => setTrending(d.posts))
      .catch(() => setTrending([]));
    getJSON<{ posts: PostListItem[] }>("/api/posts?featured=true&limit=4")
      .then((d) => setFeatured(d.posts))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div className="space-y-2">
      {/* Hero / search */}
      <section className="card relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold leading-tight">
            Stay ahead with SandisTech News
          </h1>
          <p className="mt-1 text-sm text-brand-100">
            Real-time news, business & events — built for your phone.
          </p>
          <button
            onClick={() => toggleSearch(true)}
            className="mt-4 flex w-full items-center gap-2 rounded-xl bg-white/95 px-4 py-3 text-left text-sm text-slate-500 shadow-sm"
          >
            <Search className="h-5 w-5" />
            <span className="flex-1">Search news, businesses, events…</span>
            <Mic className="h-5 w-5" />
          </button>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-white/10" />
      </section>

      <QuickLinks />

      {/* Featured */}
      <SectionHeader
        title="Featured"
        subtitle="Editor's picks & highlights"
        action={<Badge icon={<Sparkles className="h-4 w-4" />} />}
      />
      <FeedRow data={featured} cols />

      {/* Trending */}
      <SectionHeader
        title="Trending"
        subtitle="Most viewed right now"
        action={
          <Link href="/news?sort=popular" className="text-sm font-semibold text-brand-600">
            See all
          </Link>
        }
      />
      <FeedRow data={trending} icon={<Flame className="h-4 w-4" />} />

      {/* Recent */}
      <SectionHeader
        title="Recent"
        subtitle="Latest across the platform"
        action={
          <Link href="/news" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <FeedRow data={recent} />
    </div>
  );
}

function QuickLinks() {
  const links = [
    { href: "/news", label: "News", color: "from-sky-500 to-blue-600" },
    { href: "/business", label: "Business", color: "from-emerald-500 to-teal-600" },
    { href: "/events", label: "Events", color: "from-fuchsia-500 to-purple-600" },
    { href: "/support", label: "Support", color: "from-amber-500 to-orange-600" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 pt-2">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`rounded-2xl bg-gradient-to-br ${l.color} px-2 py-4 text-center text-xs font-bold text-white shadow-sm transition active:scale-95`}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}

function Badge({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
      {icon}
    </span>
  );
}

function FeedRow({
  data,
  cols,
  icon,
}: {
  data: PostListItem[] | null;
  cols?: boolean;
  icon?: React.ReactNode;
}) {
  if (data === null) {
    return (
      <div className={cols ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <EmptyState
        title="Nothing here yet"
        description="Content will appear once posts are published."
        icon={icon ?? <TrendingUp className="h-8 w-8" />}
      />
    );
  }
  return (
    <div className={cols ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
      {data.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
