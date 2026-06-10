"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Newspaper } from "lucide-react";
import PostCard from "@/components/PostCard";
import { CategoryChips, CardSkeleton, EmptyState, Spinner } from "@/components/ui/Common";
import { getJSON } from "@/lib/client";
import type { PostListItem } from "@/lib/types";

const CATEGORIES = [
  "All",
  "Sports",
  "Education",
  "Music",
  "Film",
  "Entertainment",
  "Comedy",
  "TV Shows",
];

const SORTS = [
  { value: "recent", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "liked", label: "Most Liked" },
];

const PAGE_SIZE = 8;

export default function NewsFeed() {
  const params = useSearchParams();
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState(params.get("sort") ?? "recent");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const buildUrl = useCallback(
    (p: number) => {
      const q = new URLSearchParams({
        type: "news",
        sort,
        page: String(p),
        limit: String(PAGE_SIZE),
      });
      if (category !== "All") q.set("category", category);
      if (debounced) q.set("search", debounced);
      return `/api/posts?${q.toString()}`;
    },
    [category, sort, debounced]
  );

  // reset on filter change
  useEffect(() => {
    let active = true;
    setLoading(true);
    setPage(1);
    getJSON<{ posts: PostListItem[]; hasMore: boolean }>(buildUrl(1))
      .then((d) => {
        if (!active) return;
        setPosts(d.posts);
        setHasMore(d.hasMore);
      })
      .catch(() => active && setPosts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [buildUrl]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    const next = page + 1;
    getJSON<{ posts: PostListItem[]; hasMore: boolean }>(buildUrl(next))
      .then((d) => {
        setPosts((prev) => [...prev, ...d.posts]);
        setHasMore(d.hasMore);
        setPage(next);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [buildUrl, hasMore, loading, loadingMore, page]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <Newspaper className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-extrabold tracking-tight">News</h1>
      </div>
      <p className="mb-3 text-sm text-muted">Breaking stories, updated in real time.</p>

      <div className="mb-2 flex items-center gap-2 rounded-xl border px-3">
        <Search className="h-4 w-4 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search news…"
          className="h-11 flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <CategoryChips categories={CATEGORIES} active={category} onChange={setCategory} />

      <div className="no-scrollbar -mx-3 mt-1 flex gap-2 overflow-x-auto px-3 pb-1">
        {SORTS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSort(s.value)}
            className={`chip ${sort === s.value ? "chip-active" : "muted border-transparent"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : posts.length === 0 ? (
          <EmptyState
            title="No news found"
            description="Try a different category or search term."
            icon={<Newspaper className="h-8 w-8" />}
          />
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>

      {loadingMore && <Spinner />}
      <div ref={sentinel} className="h-8" />
      {!hasMore && posts.length > 0 && (
        <p className="py-6 text-center text-xs text-muted">You&apos;ve reached the end.</p>
      )}
    </div>
  );
}
