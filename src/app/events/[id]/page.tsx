"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  User,
  Clock,
  Check,
  Share2,
  ArrowLeft,
  Bookmark,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react";
import { Spinner } from "@/components/ui/Common";
import { WhatsAppIcon } from "@/components/BusinessCard";
import { getJSON, postJSON } from "@/lib/client";
import { useStore } from "@/store/useStore";
import type { EventItem } from "@/lib/types";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useStore();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [rsvped, setRsvped] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getJSON<{ event: EventItem; rsvped: boolean; rsvpCount: number }>(
      `/api/events/${id}`
    )
      .then((d) => {
        setEvent(d.event);
        setRsvped(d.rsvped);
        setRsvpCount(d.rsvpCount);
      })
      .catch(() => setError("Event not found"))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleRsvp() {
    if (!user) return router.push("/login");
    const r = await postJSON<{ rsvped: boolean; rsvpCount: number }>(
      `/api/events/${id}/rsvp`,
      {}
    ).catch(() => null);
    if (r) {
      setRsvped(r.rsvped);
      setRsvpCount(r.rsvpCount);
    }
  }

  function share() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: event?.title, url }).catch(() => {});
    else navigator.clipboard.writeText(url).catch(() => {});
  }

  if (loading) return <Spinner className="py-20" />;
  if (error || !event)
    return <p className="py-20 text-center text-muted">{error || "Not found"}</p>;

  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : null;

  return (
    <div className="animate-fade-in">
      <button onClick={() => router.back()} className="btn-ghost mb-3 !px-2">
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      {event.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.imageUrl}
          alt={event.title}
          className="mb-4 aspect-[16/9] w-full rounded-2xl object-cover"
        />
      )}

      <span className="inline-block rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
        {event.category}
      </span>
      <h1 className="mt-2 text-2xl font-extrabold leading-tight">{event.title}</h1>

      <div className="mt-4 space-y-2 text-sm">
        <InfoRow icon={<Calendar className="h-4 w-4" />}>
          {start.toLocaleDateString("en", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </InfoRow>
        <InfoRow icon={<Clock className="h-4 w-4" />}>
          {start.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
          {end &&
            ` – ${end.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}`}
        </InfoRow>
        {event.location && (
          <InfoRow icon={<MapPin className="h-4 w-4" />}>{event.location}</InfoRow>
        )}
        {event.organizer && (
          <InfoRow icon={<User className="h-4 w-4" />}>
            Organized by {event.organizer}
          </InfoRow>
        )}
      </div>

      {event.organizer && (
        <div className="card-soft mt-4 flex items-center gap-3 p-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white">
            <User className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-muted">Organized by</p>
            <p className="font-semibold">{event.organizer}</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={toggleRsvp}
          className={`flex-1 ${rsvped ? "btn-ghost border" : "btn-primary"}`}
        >
          {rsvped ? (
            <>
              <Check className="h-4 w-4" /> Going ({rsvpCount})
            </>
          ) : (
            <>★ RSVP ({rsvpCount})</>
          )}
        </button>
        <button
          onClick={() => setSaved((s) => !s)}
          className={`btn-ghost border ${saved ? "text-brand-600" : ""}`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} /> Save
        </button>
        <button onClick={share} className="btn-ghost border">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {event.description && (
        <div className="mt-5">
          <h2 className="mb-2 font-bold">About this event</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
            {event.description}
          </p>
        </div>
      )}

      <div className="mt-5">
        <h2 className="mb-2 font-bold">Share Event</h2>
        <ShareRow title={event.title} />
      </div>

      {event.location && (
        <div className="mt-5">
          <h2 className="mb-2 font-bold">Location</h2>
          <iframe
            title="map"
            className="aspect-[16/10] w-full rounded-2xl border"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              event.location
            )}&output=embed`}
          />
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-muted">
      <span className="text-brand-600">{icon}</span>
      <span className="text-[rgb(var(--foreground))]">{children}</span>
    </div>
  );
}

function ShareRow({ title }: { title: string }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const enc = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  const links = [
    { icon: <Facebook className="h-5 w-5" />, color: "bg-[#1877f2]", href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { icon: <Twitter className="h-5 w-5" />, color: "bg-slate-900", href: `https://twitter.com/intent/tweet?url=${enc}&text=${text}` },
    { icon: <Linkedin className="h-5 w-5" />, color: "bg-[#0a66c2]", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}` },
    { icon: <WhatsAppIcon className="h-5 w-5" />, color: "bg-emerald-500", href: `https://wa.me/?text=${text}%20${enc}` },
    { icon: <Mail className="h-5 w-5" />, color: "bg-brand-600", href: `mailto:?subject=${text}&body=${enc}` },
  ];
  return (
    <div className="flex gap-3">
      {links.map((l, i) => (
        <a
          key={i}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`grid h-11 w-11 place-items-center rounded-full text-white transition active:scale-95 ${l.color}`}
        >
          {l.icon}
        </a>
      ))}
    </div>
  );
}
