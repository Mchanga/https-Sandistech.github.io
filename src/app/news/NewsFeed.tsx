"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Newspaper, SlidersHorizontal, Check } from "lucide-react";
import { PostHero, PostRow } from "@/components/PostCard";
import { SegTabs, CardSkeleton, EmptyState, Spinner } from "@/components/ui/Common";
import { getJSON } from "@/lib/client";
import type { PostListItem } from "@/lib/types";

const CATEGORIES = [
  "All News",
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
  { value: "popular", label: "Most Viewed" },
  { value: "liked", label: "Most Liked" },
];

const PAGE_SIZE = 8;

export default function NewsFeed() {
  const params = useSearchParams();
  const [category, setCategory] = useState("All News");
  const [sort, setSort] = useState(params.get("sort") ?? "recent");
  const [filterOpen, setFilterOpen] = useState(false);
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
      if (category !== "All News") q.set("category", category);
      if (debounced) q.set("search", debounced);
      return `/api/posts?${q.toString()}`;
    },
    [category, sort, debounced]
  );

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

  // realtime: prepend newly published posts
  useEffect(() => {
    const onNew = (e: Event) => {
      const post = (e as CustomEvent<PostListItem>).detail;
      if (!post || post.type !== "news") return;
      if (category !== "All News" && post.category !== category) return;
      setPosts((prev) =>
        prev.some((p) => p.id === post.id) ? prev : [post, ...prev]
      );
    };
    window.addEventListener("sandistech:new_post", onNew as EventListener);
    return () =>
      window.removeEventListener("sandistech:new_post", onNew as EventListener);
  }, [category]);

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
      <div className="mb-2 flex items-center gap-2">
        <Newspaper className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-extrabold tracking-tight">News</h1>
        <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-green-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> Live
        </span>
      </div>

      <SegTabs tabs={CATEGORIES} active={category} onChange={setCategory} />

      <div className="relative mt-2 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border px-3">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search news…"
            className="h-11 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <button
          onClick={() => setFilterOpen((v) => !v)}
          aria-label="Filter"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border text-brand-600"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
        {filterOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setFilterOpen(false)} />
            <div className="card absolute right-0 top-12 z-40 w-48 overflow-hidden p-1 shadow-xl animate-fade-in">
              <p className="px-3 py-1.5 text-xs font-semibold uppercase text-muted">
                Sort by
              </p>
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => {
                    setSort(s.value);
                    setFilterOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {s.label}
                  {sort === s.value && <Check className="h-4 w-4 text-brand-600" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3 space-y-3">
        {loading ? (
          <>
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
          <>
            <PostHero post={posts[0]} />
            {posts.slice(1).map((p) => (
              <PostRow key={p.id} post={p} />
            ))}
          </>
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
