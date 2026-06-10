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
} from "lucide-react";
import { Spinner } from "@/components/ui/Common";
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
            <>RSVP ({rsvpCount})</>
          )}
        </button>
        <button onClick={share} className="btn-ghost border">
          <Share2 className="h-4 w-4" /> Share
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
