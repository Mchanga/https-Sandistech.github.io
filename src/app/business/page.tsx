"use client";

import { useEffect, useState } from "react";
import { Briefcase, Phone, Mail, MapPin, Globe, MessageCircle, Search } from "lucide-react";
import PostCard from "@/components/PostCard";
import { CategoryChips, CardSkeleton, EmptyState, Spinner } from "@/components/ui/Common";
import { getJSON } from "@/lib/client";
import type { Business, PostListItem } from "@/lib/types";

const TABS = ["Market Updates", "Business Articles", "Local Business Listings"];

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

      <CategoryChips categories={TABS} active={tab} onChange={setTab} />

      <div className="mt-3">
        {tab === "Local Business Listings" ? (
          <Listings search={search} />
        ) : (
          <BusinessArticles category={tab} search={search} />
        )}
      </div>
    </div>
  );
}

function BusinessArticles({ category, search }: { category: string; search: string }) {
  const [posts, setPosts] = useState<PostListItem[] | null>(null);
  useEffect(() => {
    const q = new URLSearchParams({ type: "business", category, limit: "20" });
    if (search) q.set("search", search);
    setPosts(null);
    getJSON<{ posts: PostListItem[] }>(`/api/posts?${q}`)
      .then((d) => setPosts(d.posts))
      .catch(() => setPosts([]));
  }, [category, search]);

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

function BusinessCard({ business: b }: { business: Business }) {
  const phone = (b.whatsapp || b.phone || "").replace(/[^0-9]/g, "");
  return (
    <div className="card overflow-hidden animate-fade-in">
      {b.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={b.imageUrl} alt={b.name} className="aspect-[16/9] w-full object-cover" />
      )}
      <div className="p-4">
        <span className="inline-block rounded-full muted px-2.5 py-1 text-xs font-semibold">
          {b.category}
        </span>
        <h3 className="mt-2 text-base font-bold">{b.name}</h3>
        {b.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{b.description}</p>
        )}
        <div className="mt-2 space-y-1 text-xs text-muted">
          {b.location && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {b.location}
            </p>
          )}
          {b.website && (
            <a
              href={b.website.startsWith("http") ? b.website : `https://${b.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-brand-600"
            >
              <Globe className="h-3.5 w-3.5" /> {b.website}
            </a>
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {phone && (
            <a
              href={`https://wa.me/${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 rounded-xl bg-green-500 px-2 py-2 text-xs font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}
          {b.phone && (
            <a
              href={`tel:${b.phone}`}
              className="flex items-center justify-center gap-1 rounded-xl bg-brand-600 px-2 py-2 text-xs font-semibold text-white"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
          )}
          {b.email && (
            <a
              href={`mailto:${b.email}`}
              className="flex items-center justify-center gap-1 rounded-xl muted px-2 py-2 text-xs font-semibold"
            >
              <Mail className="h-4 w-4" /> Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
