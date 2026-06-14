"use client";

import { useEffect, useState } from "react";
import { Newspaper, Briefcase, Calendar, Trash2, Pencil, X } from "lucide-react";
import { Spinner } from "@/components/ui/Common";
import { getJSON, patchJSON, del } from "@/lib/client";
import type { PostListItem, Business, EventItem } from "@/lib/types";

type Kind = "post" | "business" | "event";

export default function ManageContent() {
  const [kind, setKind] = useState<Kind>("post");
  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <Pill active={kind === "post"} onClick={() => setKind("post")} icon={<Newspaper className="h-4 w-4" />}>
          Posts
        </Pill>
        <Pill active={kind === "business"} onClick={() => setKind("business")} icon={<Briefcase className="h-4 w-4" />}>
          Businesses
        </Pill>
        <Pill active={kind === "event"} onClick={() => setKind("event")} icon={<Calendar className="h-4 w-4" />}>
          Events
        </Pill>
      </div>
      {kind === "post" && <PostList />}
      {kind === "business" && <BusinessList />}
      {kind === "event" && <EventList />}
    </div>
  );
}

function Pill({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold ${
        active ? "border-brand-600 bg-brand-600 text-white" : "muted border-transparent"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="py-10 text-center text-sm text-muted">No {label} yet.</p>;
}

/* ---------------- Posts ---------------- */
function PostList() {
  const [items, setItems] = useState<PostListItem[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", status: "published" });

  function load() {
    getJSON<{ posts: PostListItem[] }>("/api/posts?status=all&limit=50")
      .then((d) => setItems(d.posts))
      .catch(() => setItems([]));
  }
  useEffect(load, []);

  async function remove(slug: string) {
    if (!confirm("Delete this post?")) return;
    await del(`/api/posts/${slug}`).catch(() => {});
    setItems((p) => p?.filter((x) => x.slug !== slug) ?? null);
  }
  async function save(slug: string) {
    await patchJSON(`/api/posts/${slug}`, draft).catch(() => {});
    setEditing(null);
    load();
  }

  if (items === null) return <Spinner className="py-12" />;
  if (items.length === 0) return <Empty label="posts" />;

  return (
    <div className="space-y-2">
      {items.map((p) => (
        <div key={p.id} className="card p-3">
          {editing === p.slug ? (
            <div className="space-y-2">
              <input
                className="input"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
              <select
                className="input"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => save(p.slug)} className="btn-primary flex-1">
                  Save
                </button>
                <button onClick={() => setEditing(null)} className="btn-ghost">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.title}</p>
                <p className="text-xs text-muted">
                  {p.category} · {p.type}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditing(p.slug);
                  setDraft({ title: p.title, status: "published" });
                }}
                className="btn-ghost !px-2"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(p.slug)}
                className="btn-ghost !px-2 text-red-500"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Businesses ---------------- */
function BusinessList() {
  const [items, setItems] = useState<Business[] | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState({ name: "", phone: "", whatsapp: "", email: "", location: "" });

  function load() {
    getJSON<{ businesses: Business[] }>("/api/businesses")
      .then((d) => setItems(d.businesses))
      .catch(() => setItems([]));
  }
  useEffect(load, []);

  async function remove(id: number) {
    if (!confirm("Delete this business?")) return;
    await del(`/api/businesses/${id}`).catch(() => {});
    setItems((p) => p?.filter((x) => x.id !== id) ?? null);
  }
  async function save(id: number) {
    await patchJSON(`/api/businesses/${id}`, draft).catch(() => {});
    setEditing(null);
    load();
  }

  if (items === null) return <Spinner className="py-12" />;
  if (items.length === 0) return <Empty label="businesses" />;

  return (
    <div className="space-y-2">
      {items.map((b) => (
        <div key={b.id} className="card p-3">
          {editing === b.id ? (
            <div className="space-y-2">
              <input className="input" placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="input" placeholder="Phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                <input className="input" placeholder="WhatsApp" value={draft.whatsapp} onChange={(e) => setDraft({ ...draft, whatsapp: e.target.value })} />
              </div>
              <input className="input" placeholder="Email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              <input className="input" placeholder="Location" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
              <div className="flex gap-2">
                <button onClick={() => save(b.id)} className="btn-primary flex-1">Save</button>
                <button onClick={() => setEditing(null)} className="btn-ghost"><X className="h-4 w-4" /></button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{b.name}</p>
                <p className="text-xs text-muted">{b.category}</p>
              </div>
              <button
                onClick={() => {
                  setEditing(b.id);
                  setDraft({
                    name: b.name,
                    phone: b.phone ?? "",
                    whatsapp: b.whatsapp ?? "",
                    email: b.email ?? "",
                    location: b.location ?? "",
                  });
                }}
                className="btn-ghost !px-2"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(b.id)} className="btn-ghost !px-2 text-red-500" aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Events ---------------- */
function EventList() {
  const [items, setItems] = useState<EventItem[] | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState({ title: "", location: "", category: "Conferences" });

  function load() {
    getJSON<{ events: EventItem[] }>("/api/events")
      .then((d) => setItems(d.events))
      .catch(() => setItems([]));
  }
  useEffect(load, []);

  async function remove(id: number) {
    if (!confirm("Delete this event?")) return;
    await del(`/api/events/${id}`).catch(() => {});
    setItems((p) => p?.filter((x) => x.id !== id) ?? null);
  }
  async function save(id: number) {
    await patchJSON(`/api/events/${id}`, draft).catch(() => {});
    setEditing(null);
    load();
  }

  if (items === null) return <Spinner className="py-12" />;
  if (items.length === 0) return <Empty label="events" />;

  return (
    <div className="space-y-2">
      {items.map((ev) => (
        <div key={ev.id} className="card p-3">
          {editing === ev.id ? (
            <div className="space-y-2">
              <input className="input" placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <input className="input" placeholder="Location" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
              <select className="input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                <option>Conferences</option>
                <option>Concerts</option>
                <option>Sports Events</option>
                <option>Calendar Events</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => save(ev.id)} className="btn-primary flex-1">Save</button>
                <button onClick={() => setEditing(null)} className="btn-ghost"><X className="h-4 w-4" /></button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{ev.title}</p>
                <p className="text-xs text-muted">
                  {ev.category} · {new Date(ev.startDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditing(ev.id);
                  setDraft({ title: ev.title, location: ev.location ?? "", category: ev.category });
                }}
                className="btn-ghost !px-2"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(ev.id)} className="btn-ghost !px-2 text-red-500" aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
