"use client";

import { useEffect, useState } from "react";
import { Briefcase, Search } from "lucide-react";
import PostCard from "@/components/PostCard";
import BusinessCard from "@/components/BusinessCard";
import MarketTicker from "@/components/MarketTicker";
import { SegTabs, CardSkeleton, EmptyState, Spinner, SectionHeader } from "@/components/ui/Common";
import { getJSON } from "@/lib/client";
import type { Business, PostListItem } from "@/lib/types";

const TABS = ["Market Updates", "Articles", "Listings"];

export default function BusinessPage() {
  const [tab, setTab] = useState(TABS[0]);
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <Briefcase className="h-6 w-6 text-emerald-600" />
        <h1 className="text-2xl font-extrabold tracking-tight">Business</h1>
      </div>
      <p className="mb-3 text-sm text-muted">
        Market updates, articles & local business directory.
      </p>

      <div className="mb-2 flex items-center gap-2 rounded-xl border px-3">
        <Search className="h-4 w-4 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search businesses…"
          className="h-11 flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <SegTabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-3">
        {tab === "Market Updates" && <MarketUpdates search={search} />}
        {tab === "Articles" && <BusinessArticles search={search} />}
        {tab === "Listings" && <Listings search={search} />}
      </div>
    </div>
  );
}

function MarketUpdates({ search }: { search: string }) {
  const [items, setItems] = useState<Business[] | null>(null);
  useEffect(() => {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    setItems(null);
    getJSON<{ businesses: Business[] }>(`/api/businesses?${q}`)
      .then((d) => setItems(d.businesses))
      .catch(() => setItems([]));
  }, [search]);

  return (
    <div className="space-y-4">
      <section>
        <h2 className="mb-2 flex items-center gap-2 text-base font-extrabold">
          Market Updates
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> Live
          </span>
        </h2>
        <MarketTicker />
      </section>

      <section>
        <SectionHeader title="Featured Businesses" />
        {items === null ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No businesses listed"
            description="Featured businesses will appear here."
            icon={<Briefcase className="h-8 w-8" />}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.slice(0, 6).map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BusinessArticles({ search }: { search: string }) {
  const [posts, setPosts] = useState<PostListItem[] | null>(null);
  useEffect(() => {
    const q = new URLSearchParams({ type: "business", limit: "20" });
    if (search) q.set("search", search);
    setPosts(null);
    getJSON<{ posts: PostListItem[] }>(`/api/posts?${q}`)
      .then((d) => setPosts(d.posts))
      .catch(() => setPosts([]));
  }, [search]);

  if (posts === null)
    return (
      <div className="space-y-3">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  if (posts.length === 0)
    return (
      <EmptyState
        title="No articles yet"
        description="Business articles will appear here once published."
        icon={<Briefcase className="h-8 w-8" />}
      />
    );
  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}

function Listings({ search }: { search: string }) {
  const [items, setItems] = useState<Business[] | null>(null);
  useEffect(() => {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    setItems(null);
    getJSON<{ businesses: Business[] }>(`/api/businesses?${q}`)
      .then((d) => setItems(d.businesses))
      .catch(() => setItems([]));
  }, [search]);

  if (items === null) return <Spinner />;
  if (items.length === 0)
    return (
      <EmptyState
        title="No businesses listed"
        description="Local business listings will appear here."
        icon={<Briefcase className="h-8 w-8" />}
      />
    );
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((b) => (
        <BusinessCard key={b.id} business={b} />
      ))}
    </div>
  );
}
