"use client";

import { useState } from "react";
import {
  Newspaper,
  Briefcase,
  Calendar,
  X,
  Tag,
  Eye,
  Star,
  Send,
  Save,
  ListChecks,
} from "lucide-react";
import { postJSON } from "@/lib/client";
import RichEditor from "@/components/RichEditor";
import ImageUploader from "@/components/ImageUploader";
import ManageContent from "@/components/admin/ManageContent";
import { slugify } from "@/lib/utils";

type Sub = "post" | "business" | "event" | "manage";

export default function AdminContent() {
  const [sub, setSub] = useState<Sub>("post");

  return (
    <div>
      <div className="mb-4 grid grid-cols-4 gap-2">
        <SubTab active={sub === "post"} onClick={() => setSub("post")} icon={<Newspaper className="h-4 w-4" />}>
          Post
        </SubTab>
        <SubTab active={sub === "business"} onClick={() => setSub("business")} icon={<Briefcase className="h-4 w-4" />}>
          Business
        </SubTab>
        <SubTab active={sub === "event"} onClick={() => setSub("event")} icon={<Calendar className="h-4 w-4" />}>
          Event
        </SubTab>
        <SubTab active={sub === "manage"} onClick={() => setSub("manage")} icon={<ListChecks className="h-4 w-4" />}>
          Manage
        </SubTab>
      </div>

      {sub === "post" && <PostForm />}
      {sub === "business" && <BusinessForm />}
      {sub === "event" && <EventForm />}
      {sub === "manage" && <ManageContent />}
    </div>
  );
}

function SubTab({
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
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold ${
        active ? "border-brand-600 bg-brand-600 text-white" : "muted border-transparent"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function useSubmit(endpoint: string) {
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");
  async function submit(body: Record<string, unknown>, reset: () => void) {
    setStatus("saving");
    setError("");
    try {
      await postJSON(endpoint, body);
      setStatus("done");
      reset();
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed");
    }
  }
  return { status, error, submit };
}

const CATEGORIES = ["Sports", "Education", "Music", "Film", "Entertainment", "Comedy", "TV Shows", "Politics", "Technology"];

function PostForm() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [category, setCategory] = useState("Sports");
  const [subCategory, setSubCategory] = useState("");
  const [type, setType] = useState("news");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [postStatus, setPostStatus] = useState<"draft" | "pending" | "published">("published");
  const [featured, setFeatured] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const { status, error, submit } = useSubmit("/api/posts");

  const effectiveSlug = slugEdited ? slug : slugify(title);

  function onTitle(v: string) {
    setTitle(v);
    if (!slugEdited) setSlug(slugify(v));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  function reset() {
    setTitle("");
    setSlug("");
    setSlugEdited(false);
    setSubCategory("");
    setImageUrl("");
    setVideoUrl("");
    setExcerpt("");
    setContent("");
    setTags([]);
    setMetaTitle("");
    setMetaDescription("");
  }

  function doSubmit(e: React.FormEvent, override?: "draft" | "published") {
    e.preventDefault();
    submit(
      {
        title,
        category,
        subCategory,
        type,
        imageUrl,
        videoUrl,
        excerpt,
        content,
        tags: tags.join(","),
        metaTitle,
        metaDescription,
        status: override ?? postStatus,
        featured,
        allowComments,
      },
      reset
    );
  }

  return (
    <form onSubmit={(e) => doSubmit(e)} className="grid gap-4 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-4 lg:col-span-2">
        <div className="card-soft space-y-4 p-4">
          <Field label="Post Title" counter={`${title.length}/150`}>
            <input
              className="input"
              placeholder="Enter post title…"
              maxLength={150}
              required
              value={title}
              onChange={(e) => onTitle(e.target.value)}
            />
          </Field>

          <Field label="Slug (URL)" counter={`${effectiveSlug.length}/150`}>
            <div className="flex items-center gap-1 rounded-xl border px-3">
              <span className="text-sm text-muted">/post/</span>
              <input
                className="h-11 flex-1 bg-transparent text-sm outline-none"
                placeholder="post-url-slug"
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(slugify(e.target.value));
                }}
              />
            </div>
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Type">
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="news">News</option>
                <option value="business">Business</option>
                <option value="event">Event</option>
              </select>
            </Field>
            <Field label="Category">
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Sub Category">
              <input className="input" placeholder="Optional" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="card-soft space-y-3 p-4">
          <p className="text-sm font-bold">Featured Image</p>
          <ImageUploader value={imageUrl} onChange={setImageUrl} />
          <div>
            <label className="mb-1 block text-sm font-bold">Video URL (optional)</label>
            <input className="input" placeholder="MP4 or YouTube — square 1080×1080 recommended" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          </div>
        </div>

        <div className="card-soft space-y-2 p-4">
          <Field label="Summary / Excerpt" counter={`${excerpt.length}/250`}>
            <textarea
              className="input min-h-[70px]"
              maxLength={250}
              placeholder="Short summary shown in feed cards…"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </Field>
        </div>

        <div className="card-soft space-y-2 p-4">
          <p className="text-sm font-bold">Content</p>
          <RichEditor value={content} onChange={setContent} placeholder="Write your post content…" />
          {!content && <p className="text-xs text-muted">Tip: use the toolbar for headings, bold, lists and alignment.</p>}
        </div>

        <div className="card-soft space-y-3 p-4">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Tag className="h-4 w-4" /> Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-300">
                {t}
                <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            className="input"
            placeholder="Add a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
        </div>

        <div className="card-soft space-y-3 p-4">
          <p className="text-sm font-bold">SEO Settings</p>
          <Field label="Meta Title">
            <input className="input" placeholder="SEO meta title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
          </Field>
          <Field label="Meta Description">
            <textarea className="input min-h-[60px]" placeholder="SEO meta description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
          </Field>
        </div>
      </div>

      {/* Right rail */}
      <div className="space-y-4">
        <div className="card-soft space-y-3 p-4">
          <p className="text-sm font-bold">Publish</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={(e) => doSubmit(e, "draft")}
              disabled={status === "saving"}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold"
            >
              <Save className="h-4 w-4" /> Draft
            </button>
            <button
              type="submit"
              onClick={() => setPostStatus("published")}
              disabled={status === "saving"}
              className="btn-primary !py-2.5"
            >
              <Send className="h-4 w-4" /> Publish
            </button>
          </div>
          {status === "done" && <p className="text-sm text-green-600">Saved successfully.</p>}
          {status === "error" && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="card-soft space-y-3 p-4">
          <Field label="Post Status">
            <select className="input" value={postStatus} onChange={(e) => setPostStatus(e.target.value as typeof postStatus)}>
              <option value="draft">Draft</option>
              <option value="pending">Pending Review</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Toggle label="Mark as Featured" icon={<Star className="h-4 w-4" />} checked={featured} onChange={setFeatured} />
          <Toggle label="Allow Comments" icon={<Eye className="h-4 w-4" />} checked={allowComments} onChange={setAllowComments} />
        </div>

        <div className="card-soft p-4 text-xs text-muted">
          <p className="mb-1 font-bold text-[rgb(var(--foreground))]">Post Guidelines</p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>Use a clear, descriptive title</li>
            <li>Add a featured image for better engagement</li>
            <li>Keep the summary under 250 characters</li>
            <li>Tag relevant topics for discoverability</li>
          </ul>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  counter,
  children,
}: {
  label: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-semibold text-muted">
        {label}
        {counter && <span>{counter}</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-2 text-sm font-medium"
    >
      <span className="flex items-center gap-2 text-muted">
        {icon} {label}
      </span>
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function BusinessForm() {
  const [f, setF] = useState({
    name: "",
    category: "Local Business Listings",
    description: "",
    location: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    imageUrl: "",
    logo: "",
  });
  const { status, error, submit } = useSubmit("/api/businesses");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  return (
    <form
      className="card space-y-3 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit({ ...f }, () => setF({ ...f, name: "", description: "" }));
      }}
    >
      <input className="input" placeholder="Business name" required value={f.name} onChange={set("name")} />
      <input className="input" placeholder="Category" value={f.category} onChange={set("category")} />
      <textarea className="input min-h-[80px]" placeholder="Description" value={f.description} onChange={set("description")} />
      <input className="input" placeholder="Location" value={f.location} onChange={set("location")} />
      <div className="grid grid-cols-2 gap-3">
        <input className="input" placeholder="Phone" value={f.phone} onChange={set("phone")} />
        <input className="input" placeholder="WhatsApp" value={f.whatsapp} onChange={set("whatsapp")} />
      </div>
      <input className="input" placeholder="Email" value={f.email} onChange={set("email")} />
      <input className="input" placeholder="Website" value={f.website} onChange={set("website")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-bold">Banner</p>
          <ImageUploader value={f.imageUrl} onChange={(v) => setF((s) => ({ ...s, imageUrl: v }))} label="Banner" />
        </div>
        <div>
          <p className="mb-1 text-sm font-bold">Logo</p>
          <ImageUploader value={f.logo} onChange={(v) => setF((s) => ({ ...s, logo: v }))} label="Logo" />
        </div>
      </div>
      <p className="text-xs text-muted">New businesses start at 0 rating / 0 reviews — users add ratings.</p>
      <FormFooter status={status} error={error} label="Add business" />
    </form>
  );
}

function EventForm() {
  const [f, setF] = useState({
    title: "",
    category: "Conferences",
    description: "",
    location: "",
    organizer: "",
    startDate: "",
    endDate: "",
    imageUrl: "",
  });
  const { status, error, submit } = useSubmit("/api/events");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  return (
    <form
      className="card space-y-3 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit(
          {
            ...f,
            startDate: new Date(f.startDate).toISOString(),
            endDate: f.endDate ? new Date(f.endDate).toISOString() : undefined,
          },
          () => setF({ ...f, title: "", description: "" })
        );
      }}
    >
      <input className="input" placeholder="Event title" required value={f.title} onChange={set("title")} />
      <select className="input" value={f.category} onChange={set("category")}>
        <option>Conferences</option>
        <option>Concerts</option>
        <option>Sports Events</option>
        <option>Calendar Events</option>
      </select>
      <textarea className="input min-h-[80px]" placeholder="Description" value={f.description} onChange={set("description")} />
      <input className="input" placeholder="Location" value={f.location} onChange={set("location")} />
      <input className="input" placeholder="Organizer" value={f.organizer} onChange={set("organizer")} />
      <div>
        <p className="mb-1 text-sm font-bold">Event Image</p>
        <ImageUploader value={f.imageUrl} onChange={(v) => setF((s) => ({ ...s, imageUrl: v }))} label="Event image" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Start</label>
          <input className="input" type="datetime-local" required value={f.startDate} onChange={set("startDate")} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">End</label>
          <input className="input" type="datetime-local" value={f.endDate} onChange={set("endDate")} />
        </div>
      </div>
      <FormFooter status={status} error={error} label="Create event" />
    </form>
  );
}

function FormFooter({
  status,
  error,
  label,
}: {
  status: "idle" | "saving" | "done" | "error";
  error: string;
  label: string;
}) {
  return (
    <>
      {status === "done" && <p className="text-sm text-green-600">Saved successfully.</p>}
      {status === "error" && <p className="text-sm text-red-500">{error}</p>}
      <button className="btn-primary w-full" disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : label}
      </button>
    </>
  );
}
