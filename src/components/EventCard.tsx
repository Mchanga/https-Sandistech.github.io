"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Calendar, Check, Bookmark, Share2, Users } from "lucide-react";
import { postJSON } from "@/lib/client";
import { useStore } from "@/store/useStore";
import type { EventItem } from "@/lib/types";

export default function EventCard({ event: e }: { event: EventItem }) {
  const router = useRouter();
  const { user } = useStore();
  const [rsvped, setRsvped] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(e.rsvpCount ?? 0);
  const [saved, setSaved] = useState(false);
  const date = new Date(e.startDate);

  async function rsvp(ev: React.MouseEvent) {
    ev.preventDefault();
    if (!user) return router.push("/login");
    const r = await postJSON<{ rsvped: boolean; rsvpCount: number }>(`/api/events/${e.id}/rsvp`, {}).catch(() => null);
    if (r) {
      setRsvped(r.rsvped);
      setRsvpCount(r.rsvpCount);
    }
  }

  function share(ev: React.MouseEvent) {
    ev.preventDefault();
    const url = `${window.location.origin}/events/${e.id}`;
    if (navigator.share) navigator.share({ title: e.title, url }).catch(() => {});
    else navigator.clipboard.writeText(url).catch(() => {});
  }

  return (
    <Link
      href={`/events/${e.id}`}
      className="card-soft block overflow-hidden transition hover:shadow-lg animate-fade-in"
    >
      <div className="relative aspect-[16/9] w-full">
        {e.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.imageUrl} alt={e.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-600 to-brand-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-purple-700">
          {e.category}
        </span>
        <div className="absolute right-3 top-3 grid h-12 w-12 flex-col place-items-center rounded-xl bg-white/95 text-center text-purple-700 shadow">
          <span className="text-base font-black leading-none">{date.getDate()}</span>
          <span className="text-[9px] font-bold uppercase">
            {date.toLocaleString("en", { month: "short" })}
          </span>
        </div>
        <h3 className="absolute inset-x-0 bottom-0 line-clamp-2 p-3 text-lg font-extrabold text-white drop-shadow">
          {e.title}
        </h3>
      </div>

      <div className="space-y-1.5 p-3 text-sm text-muted">
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-600" />
          {date.toLocaleDateString("en", { month: "long", day: "numeric" })} ·{" "}
          {date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
        </p>
        {e.location && (
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-600" /> {e.location}
          </p>
        )}
        <p className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-600" /> {rsvpCount} going
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 pb-3">
        <button
          onClick={rsvp}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
            rsvped ? "bg-green-600 text-white" : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
        >
          {rsvped ? <Check className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
          {rsvped ? `Going (${rsvpCount})` : `RSVP (${rsvpCount})`}
        </button>
        <button
          onClick={(ev) => {
            ev.preventDefault();
            setSaved((s) => !s);
          }}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition ${
            saved ? "border-brand-600 text-brand-600" : "text-muted hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} /> Save
        </button>
        <button
          onClick={share}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold text-muted transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
    </Link>
  );
}
