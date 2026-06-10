"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  MapPin,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { CategoryChips, EmptyState, Spinner } from "@/components/ui/Common";
import { getJSON } from "@/lib/client";
import type { EventItem } from "@/lib/types";

const CATEGORIES = [
  "All",
  "Conferences",
  "Concerts",
  "Sports Events",
  "Calendar Events",
];

export default function EventsPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [events, setEvents] = useState<EventItem[] | null>(null);

  useEffect(() => {
    const q = new URLSearchParams();
    if (category !== "All") q.set("category", category);
    if (search) q.set("search", search);
    setEvents(null);
    getJSON<{ events: EventItem[] }>(`/api/events?${q}`)
      .then((d) => setEvents(d.events))
      .catch(() => setEvents([]));
  }, [category, search]);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-extrabold tracking-tight">Events</h1>
        </div>
        <div className="flex rounded-xl border p-0.5">
          <button
            onClick={() => setView("list")}
            className={`rounded-lg px-2.5 py-1.5 ${view === "list" ? "bg-brand-600 text-white" : "text-muted"}`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`rounded-lg px-2.5 py-1.5 ${view === "calendar" ? "bg-brand-600 text-white" : "text-muted"}`}
            aria-label="Calendar view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mb-3 text-sm text-muted">Discover conferences, concerts & more.</p>

      <div className="mb-2 flex items-center gap-2 rounded-xl border px-3">
        <Search className="h-4 w-4 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events…"
          className="h-11 flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <CategoryChips categories={CATEGORIES} active={category} onChange={setCategory} />

      <div className="mt-3">
        {events === null ? (
          <Spinner />
        ) : view === "calendar" ? (
          <CalendarView events={events} />
        ) : events.length === 0 ? (
          <EmptyState
            title="No events found"
            description="Upcoming events will appear here."
            icon={<CalendarIcon className="h-8 w-8" />}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event: e }: { event: EventItem }) {
  const date = new Date(e.startDate);
  return (
    <Link href={`/events/${e.id}`} className="card overflow-hidden transition hover:shadow-lg animate-fade-in">
      {e.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={e.imageUrl} alt={e.title} className="aspect-[16/9] w-full object-cover" />
      )}
      <div className="flex gap-3 p-4">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-600 text-white">
          <span className="text-lg font-black leading-none">{date.getDate()}</span>
          <span className="text-[10px] font-semibold uppercase">
            {date.toLocaleString("en", { month: "short" })}
          </span>
        </div>
        <div className="min-w-0">
          <span className="inline-block rounded-full muted px-2 py-0.5 text-[11px] font-semibold">
            {e.category}
          </span>
          <h3 className="mt-1 line-clamp-2 font-bold">{e.title}</h3>
          {e.location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5" /> {e.location}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function CalendarView({ events }: { events: EventItem[] }) {
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const byDay = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of events) {
      const d = new Date(e.startDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = String(d.getDate());
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(e);
      }
    }
    return map;
  }, [events, year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="btn-ghost !px-2">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-bold">
          {cursor.toLocaleString("en", { month: "long", year: "numeric" })}
        </p>
        <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="btn-ghost !px-2">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const dayEvents = day ? byDay.get(String(day)) : undefined;
          return (
            <div
              key={i}
              className={`min-h-[44px] rounded-lg p-1 text-xs ${day ? "muted" : ""}`}
            >
              {day && (
                <>
                  <span className="font-semibold">{day}</span>
                  {dayEvents && (
                    <div className="mt-0.5 space-y-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <Link
                          key={e.id}
                          href={`/events/${e.id}`}
                          className="block truncate rounded bg-brand-600 px-1 py-0.5 text-[9px] text-white"
                        >
                          {e.title}
                        </Link>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] text-brand-600">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
