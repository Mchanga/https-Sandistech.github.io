"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Newspaper,
  Briefcase,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Star,
} from "lucide-react";
import { Spinner } from "@/components/ui/Common";
import { getJSON } from "@/lib/client";
import { formatNumber } from "@/lib/utils";

interface Analytics {
  totals: {
    users: number;
    posts: number;
    businesses: number;
    events: number;
    comments: number;
    likes: number;
    feedback: number;
    views: number;
  };
  byType: { type: string; count: number; views: number }[];
  topPosts: { title: string; slug: string; views: number; likes: number }[];
}

export default function AdminOverview() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    getJSON<Analytics>("/api/admin/analytics")
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) return <Spinner className="py-16" />;

  const cards = [
    { label: "Users", value: data.totals.users, icon: Users, color: "bg-blue-500" },
    { label: "Posts", value: data.totals.posts, icon: Newspaper, color: "bg-sky-500" },
    { label: "Businesses", value: data.totals.businesses, icon: Briefcase, color: "bg-emerald-500" },
    { label: "Events", value: data.totals.events, icon: Calendar, color: "bg-purple-500" },
    { label: "Total Views", value: data.totals.views, icon: Eye, color: "bg-orange-500" },
    { label: "Comments", value: data.totals.comments, icon: MessageCircle, color: "bg-pink-500" },
    { label: "Likes", value: data.totals.likes, icon: Heart, color: "bg-red-500" },
    { label: "Feedback", value: data.totals.feedback, icon: Star, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${c.color} text-white`}>
              <c.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-2xl font-extrabold">{formatNumber(c.value)}</p>
            <p className="text-xs text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="mb-3 font-bold">Content by type</h3>
        <div className="space-y-3">
          {data.byType.length === 0 && (
            <p className="text-sm text-muted">No posts yet.</p>
          )}
          {data.byType.map((t) => {
            const max = Math.max(...data.byType.map((x) => x.count), 1);
            return (
              <div key={t.type}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium capitalize">{t.type}</span>
                  <span className="text-muted">
                    {t.count} posts · {formatNumber(t.views)} views
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full muted">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${(t.count / max) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-3 font-bold">Top posts</h3>
        <div className="space-y-2">
          {data.topPosts.length === 0 && (
            <p className="text-sm text-muted">No posts yet.</p>
          )}
          {data.topPosts.map((p, i) => (
            <div key={p.slug} className="flex items-center gap-3 text-sm">
              <span className="grid h-6 w-6 place-items-center rounded-full muted text-xs font-bold">
                {i + 1}
              </span>
              <span className="flex-1 truncate font-medium">{p.title}</span>
              <span className="flex items-center gap-1 text-xs text-muted">
                <Eye className="h-3.5 w-3.5" /> {formatNumber(p.views)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted">
                <Heart className="h-3.5 w-3.5" /> {formatNumber(p.likes)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
