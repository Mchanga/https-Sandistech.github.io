"use client";

import { useEffect, useState } from "react";
import { Newspaper, Briefcase, Calendar, Trash2, Pencil, X, Star } from "lucide-react";
import { Spinner } from "@/components/ui/Common";
import { getJSON, patchJSON, del } from "@/lib/client";
import ImageUploader from "@/components/ImageUploader";
import VideoUploader from "@/components/VideoUploader";
import RichEditor from "@/components/RichEditor";
import type { PostListItem, PostDetail, Business, EventItem } from "@/lib/types";

const POST_CATEGORIES = ["Sports", "Education", "Music", "Film", "Entertainment", "Comedy", "TV Shows", "Politics", "Technology"];

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

  if (items === null) return <Spinner className="py-12" />;
  if (items.length === 0) return <Empty label="posts" />;

  return (
    <div className="space-y-2">
      {items.map((p) =>
        editing === p.slug ? (
          <PostEditor
            key={p.id}
            slug={p.slug}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        ) : (
          <div key={p.id} className="card p-3">
            <div className="flex items-center gap-3">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg muted">
                  <Newspaper className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.title}</p>
                <p className="text-xs text-muted">
                  {p.category} · {p.type}
                  {p.status && p.status !== "published" ? ` · ${p.status}` : ""}
                </p>
              </div>
              <button
                onClick={() => setEditing(p.slug)}
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
          </div>
        )
      )}
    </div>
  );
}

function PostEditor({
  slug,
  onClose,
  onSaved,
}: {
  slug: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<{
    title: string;
    category: string;
    type: string;
    status: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    videoUrl: string;
    featured: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getJSON<{ post: PostDetail }>(`/api/posts/${slug}`)
      .then((d) =>
        setDraft({
          title: d.post.title,
          category: d.post.category,
          type: d.post.type,
          status: d.post.status ?? "published",
          excerpt: d.post.excerpt ?? "",
          content: d.post.content ?? "",
          imageUrl: d.post.imageUrl ?? "",
          videoUrl: d.post.videoUrl ?? "",
          featured: d.post.featured ?? false,
        })
      )
      .catch(() => setError("Could not load this post."));
  }, [slug]);

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError("");
    try {
      await patchJSON(`/api/posts/${slug}`, draft);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setSaving(false);
    }
  }

  const upd = <K extends keyof NonNullable<typeof draft>>(
    k: K,
    v: NonNullable<typeof draft>[K]
  ) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  if (error && !draft) return <p className="card p-3 text-sm text-red-600">{error}</p>;
  if (!draft) return <Spinner className="py-8" />;

  return (
    <div className="card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <p className="font-bold">Edit post</p>
        <button onClick={onClose} className="btn-ghost !px-2" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Title</label>
        <input className="input" value={draft.title} onChange={(e) => upd("title", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Category</label>
          <select className="input" value={draft.category} onChange={(e) => upd("category", e.target.value)}>
            {POST_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
            {!POST_CATEGORIES.includes(draft.category) && <option>{draft.category}</option>}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Type</label>
          <select className="input" value={draft.type} onChange={(e) => upd("type", e.target.value)}>
            <option value="news">News</option>
            <option value="business">Business</option>
            <option value="event">Event</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Featured Image</label>
        <ImageUploader value={draft.imageUrl} onChange={(v) => upd("imageUrl", v)} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Video</label>
        <VideoUploader value={draft.videoUrl} onChange={(v) => upd("videoUrl", v)} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Excerpt</label>
        <textarea
          className="input min-h-[60px]"
          value={draft.excerpt}
          onChange={(e) => upd("excerpt", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Content</label>
        <RichEditor value={draft.content} onChange={(v) => upd("content", v)} placeholder="Edit your post content…" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <select className="input flex-1" value={draft.status} onChange={(e) => upd("status", e.target.value)}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
        </select>
        <button
          type="button"
          onClick={() => upd("featured", !draft.featured)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
            draft.featured ? "border-brand-600 bg-brand-600 text-white" : ""
          }`}
        >
          <Star className="h-4 w-4" /> Featured
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button onClick={save} disabled={saving} className="btn-primary flex-1">
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button onClick={onClose} className="btn-ghost">
          Cancel
        </button>
      </div>
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
