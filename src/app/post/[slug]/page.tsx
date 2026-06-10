"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ArrowLeft,
  Send,
} from "lucide-react";
import { Spinner } from "@/components/ui/Common";
import VideoEmbed from "@/components/VideoEmbed";
import { getJSON, postJSON } from "@/lib/client";
import { useStore } from "@/store/useStore";
import { formatNumber, timeAgo } from "@/lib/utils";
import type { PostDetail, CommentItem } from "@/lib/types";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useStore();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    getJSON<{ post: PostDetail; liked: boolean; bookmarked: boolean }>(
      `/api/posts/${slug}`
    )
      .then((d) => {
        setPost(d.post);
        setLiked(d.liked);
        setBookmarked(d.bookmarked);
        setLikes(d.post.likes);
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
    getJSON<{ comments: CommentItem[] }>(`/api/posts/${slug}/comments`)
      .then((d) => setComments(d.comments))
      .catch(() => {});
  }, [slug]);

  async function toggleLike() {
    if (!user) return router.push("/login");
    const r = await postJSON<{ liked: boolean; likes: number }>(
      `/api/posts/${slug}/like`,
      {}
    ).catch(() => null);
    if (r) {
      setLiked(r.liked);
      setLikes(r.likes);
    }
  }

  async function toggleBookmark() {
    if (!user) return router.push("/login");
    const r = await postJSON<{ bookmarked: boolean }>(
      `/api/posts/${slug}/bookmark`,
      {}
    ).catch(() => null);
    if (r) setBookmarked(r.bookmarked);
  }

  function share() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: post?.title, url }).catch(() => {});
    else navigator.clipboard.writeText(url).catch(() => {});
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return router.push("/login");
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const r = await postJSON<{ comment: CommentItem }>(
        `/api/posts/${slug}/comments`,
        { comment: newComment }
      );
      setComments((prev) => [r.comment, ...prev]);
      setNewComment("");
    } finally {
      setPosting(false);
    }
  }

  if (loading) return <Spinner className="py-20" />;
  if (!post) return <p className="py-20 text-center text-muted">Post not found.</p>;

  return (
    <article className="animate-fade-in">
      <button onClick={() => router.back()} className="btn-ghost mb-3 !px-2">
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      <span className="inline-block rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
        {post.category}
      </span>
      <h1 className="mt-2 text-2xl font-extrabold leading-tight">{post.title}</h1>

      <div className="mt-3 flex items-center gap-2 text-sm text-muted">
        <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full muted">
          {post.authorAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.authorAvatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold">{(post.authorName ?? "S")[0]}</span>
          )}
        </div>
        <span className="font-medium text-[rgb(var(--foreground))]">
          {post.authorName ?? "SandisTech"}
        </span>
        <span>·</span>
        <span>{timeAgo(post.createdAt)}</span>
      </div>

      {post.videoUrl ? (
        <div className="my-4">
          <VideoEmbed url={post.videoUrl} />
        </div>
      ) : (
        post.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt={post.title}
            className="my-4 aspect-[16/9] w-full rounded-2xl object-cover"
          />
        )
      )}

      <div className="prose-sm mt-4 whitespace-pre-wrap text-[15px] leading-relaxed">
        {post.content}
      </div>

      {/* action bar */}
      <div className="sticky bottom-20 z-10 mt-6 flex items-center justify-between rounded-2xl border bg-[rgb(var(--background))]/90 p-2 backdrop-blur md:bottom-4">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleLike}
            className={`btn-ghost !px-3 ${liked ? "text-red-500" : ""}`}
          >
            <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
            {formatNumber(likes)}
          </button>
          <span className="btn-ghost !px-3">
            <MessageCircle className="h-5 w-5" /> {formatNumber(comments.length)}
          </span>
          <span className="btn-ghost !px-3">
            <Eye className="h-5 w-5" /> {formatNumber(post.views)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleBookmark}
            className={`btn-ghost !px-3 ${bookmarked ? "text-brand-600" : ""}`}
          >
            <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
          </button>
          <button onClick={share} className="btn-ghost !px-3">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* comments */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-extrabold">
          Comments ({comments.length})
        </h2>

        {user ? (
          <form onSubmit={submitComment} className="mb-4 flex gap-2">
            <input
              className="input"
              placeholder="Add a comment…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button className="btn-primary !px-3" disabled={posting}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="card mb-4 flex items-center justify-between p-3 text-sm">
            <span className="text-muted">Log in to join the conversation.</span>
            <Link href="/login" className="btn-primary !py-2">
              Login
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="py-6 text-center text-sm text-muted">
              No comments yet. Be the first!
            </p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="card p-3">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center overflow-hidden rounded-full muted">
                  {c.userAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.userAvatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold">
                      {(c.userName ?? "U")[0]}
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold">{c.userName ?? "User"}</span>
                <span className="text-xs text-muted">· {timeAgo(c.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm">{c.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
