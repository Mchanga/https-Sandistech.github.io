"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Newspaper,
  Briefcase,
  Calendar,
  Play,
} from "lucide-react";
import { postJSON } from "@/lib/client";
import { useStore } from "@/store/useStore";
import { formatNumber, timeAgo } from "@/lib/utils";
import type { PostListItem } from "@/lib/types";

const typeIcon = {
  news: Newspaper,
  business: Briefcase,
  event: Calendar,
};

export default function PostCard({ post }: { post: PostListItem }) {
  const router = useRouter();
  const { user } = useStore();
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [busy, setBusy] = useState(false);
  const Icon = typeIcon[post.type] ?? Newspaper;

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) return router.push("/login");
    if (busy) return;
    setBusy(true);
    setLiked((v) => !v);
    setLikes((n) => n + (liked ? -1 : 1));
    try {
      const r = await postJSON<{ liked: boolean; likes: number }>(
        `/api/posts/${post.slug}/like`,
        {}
      );
      setLiked(r.liked);
      setLikes(r.likes);
    } catch {
      setLiked((v) => !v);
      setLikes(post.likes);
    } finally {
      setBusy(false);
    }
  }

  async function toggleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) return router.push("/login");
    setBookmarked((v) => !v);
    try {
      const r = await postJSON<{ bookmarked: boolean }>(
        `/api/posts/${post.slug}/bookmark`,
        {}
      );
      setBookmarked(r.bookmarked);
    } catch {
      setBookmarked((v) => !v);
    }
  }

  async function share(e: React.MouseEvent) {
    e.preventDefault();
    const url = `${window.location.origin}/post/${post.slug}`;
    if (navigator.share) {
      navigator.share({ title: post.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  return (
    <Link
      href={`/post/${post.slug}`}
      className="card group block overflow-hidden transition hover:shadow-lg animate-fade-in"
    >
      {post.imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt={post.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            <Icon className="h-3.5 w-3.5" /> {post.category}
          </span>
          {post.videoUrl && (
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition group-hover:scale-110">
                <Play className="h-6 w-6 translate-x-0.5 fill-current" />
              </span>
            </span>
          )}
        </div>
      )}
      {!post.imageUrl && post.videoUrl && (
        <div className="relative grid aspect-[16/9] place-items-center overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white">
            <Play className="h-6 w-6 translate-x-0.5 fill-current" />
          </span>
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            <Icon className="h-3.5 w-3.5" /> {post.category}
          </span>
        </div>
      )}
      <div className="p-4">
        {!post.imageUrl && !post.videoUrl && (
          <span className="mb-2 inline-flex items-center gap-1 rounded-full muted px-2.5 py-1 text-xs font-semibold">
            <Icon className="h-3.5 w-3.5" /> {post.category}
          </span>
        )}
        <h3 className="line-clamp-2 text-base font-bold leading-snug">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <div className="grid h-6 w-6 place-items-center overflow-hidden rounded-full muted">
            {post.authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.authorAvatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold">
                {(post.authorName ?? "S")[0]}
              </span>
            )}
          </div>
          <span className="font-medium text-[rgb(var(--foreground))]">
            {post.authorName ?? "SandisTech"}
          </span>
          <span>·</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t pt-3 text-muted">
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" /> {formatNumber(post.views)}
            </span>
            <button
              onClick={toggleLike}
              className={`inline-flex items-center gap-1 transition ${
                liked ? "text-red-500" : "hover:text-red-500"
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              {formatNumber(likes)}
            </button>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-4 w-4" /> {formatNumber(post.commentsCount)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleBookmark}
              aria-label="Bookmark"
              className={`btn-ghost !px-2 !py-1.5 ${bookmarked ? "text-brand-600" : ""}`}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
            </button>
            <button onClick={share} aria-label="Share" className="btn-ghost !px-2 !py-1.5">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
