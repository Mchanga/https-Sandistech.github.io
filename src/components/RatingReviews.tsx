"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { getJSON, postJSON } from "@/lib/client";
import { useStore } from "@/store/useStore";
import { timeAgo } from "@/lib/utils";
import type { ReviewItem } from "@/lib/types";

/**
 * Star rating + reviews block used on article and business detail pages.
 * Ratings/reviews are created by registered users. A fresh item starts at
 * 0 rating / 0 reviews until someone rates it.
 */
export default function RatingReviews({
  endpoint,
  title = "Ratings & Reviews",
}: {
  endpoint: string; // e.g. /api/posts/<slug>/reviews or /api/businesses/<id>/reviews
  title?: string;
}) {
  const { user } = useStore();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function load() {
    getJSON<{ reviews: ReviewItem[]; rating: number; ratingCount: number }>(endpoint)
      .then((d) => {
        setReviews(d.reviews);
        setAvg(d.rating);
        setCount(d.ratingCount);
        if (user) {
          const mine = d.reviews.find((r) => r.userId === user.id);
          if (mine) {
            setMyRating(mine.rating);
            setComment(mine.comment ?? "");
          }
        }
      })
      .catch(() => {});
  }

  useEffect(load, [endpoint, user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!myRating) {
      setError("Please select a star rating.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await postJSON(endpoint, { rating: myRating, comment });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-extrabold">{title}</h2>

      <div className="card mb-4 flex items-center gap-4 p-4">
        <div className="text-center">
          <p className="text-3xl font-extrabold">{count > 0 ? avg.toFixed(1) : "0.0"}</p>
          <div className="mt-1 flex justify-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-3.5 w-3.5 ${
                  n <= Math.round(avg) ? "fill-amber-400 text-amber-400" : "text-slate-300"
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted">
            {count === 0 ? "No reviews yet" : `${count} review${count === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex-1 text-sm text-muted">
          {count === 0
            ? "Be the first to rate and review."
            : "Based on community ratings."}
        </div>
      </div>

      {user ? (
        <form onSubmit={submit} className="card mb-4 space-y-3 p-4">
          <p className="text-sm font-semibold">Your rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMyRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${n} star`}
              >
                <Star
                  className={`h-7 w-7 transition ${
                    n <= (hover || myRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            className="input min-h-[70px]"
            placeholder="Write a short review (optional)…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button className="btn-primary" disabled={busy}>
            {busy ? "Submitting…" : "Submit review"}
          </button>
        </form>
      ) : (
        <div className="card mb-4 flex items-center justify-between p-3 text-sm">
          <span className="text-muted">Log in to rate and review.</span>
          <Link href="/login" className="btn-primary !py-2">
            Login
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="card p-3">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center overflow-hidden rounded-full muted">
                {r.userAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.userAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold">{(r.userName ?? "U")[0]}</span>
                )}
              </div>
              <span className="text-sm font-semibold">{r.userName ?? "User"}</span>
              <span className="text-xs text-muted">· {timeAgo(r.createdAt)}</span>
              <span className="ml-auto flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-3.5 w-3.5 ${
                      n <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                    }`}
                  />
                ))}
              </span>
            </div>
            {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
