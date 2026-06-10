"use client";

import { useState } from "react";
import { Newspaper, Briefcase, Calendar } from "lucide-react";
import { postJSON } from "@/lib/client";

type Sub = "post" | "business" | "event";

export default function AdminContent() {
  const [sub, setSub] = useState<Sub>("post");

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <SubTab active={sub === "post"} onClick={() => setSub("post")} icon={<Newspaper className="h-4 w-4" />}>
          Post
        </SubTab>
        <SubTab active={sub === "business"} onClick={() => setSub("business")} icon={<Briefcase className="h-4 w-4" />}>
          Business
        </SubTab>
        <SubTab active={sub === "event"} onClick={() => setSub("event")} icon={<Calendar className="h-4 w-4" />}>
          Event
        </SubTab>
      </div>

      {sub === "post" && <PostForm />}
      {sub === "business" && <BusinessForm />}
      {sub === "event" && <EventForm />}
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

function PostForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Sports");
  const [type, setType] = useState("news");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const { status, error, submit } = useSubmit("/api/posts");

  return (
    <form
      className="card space-y-3 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit({ title, category, type, imageUrl, videoUrl, content }, () => {
          setTitle("");
          setContent("");
          setImageUrl("");
          setVideoUrl("");
        });
      }}
    >
      <input className="input" placeholder="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="news">News</option>
          <option value="business">Business</option>
          <option value="event">Event</option>
        </select>
        <input className="input" placeholder="Category" required value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <input className="input" placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <input className="input" placeholder="Video URL — MP4 or YouTube (optional)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
      <textarea className="input min-h-[140px]" placeholder="Content" required value={content} onChange={(e) => setContent(e.target.value)} />
      <FormFooter status={status} error={error} label="Publish post" />
    </form>
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
      <input className="input" placeholder="Image URL" value={f.imageUrl} onChange={set("imageUrl")} />
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
      <input className="input" placeholder="Image URL" value={f.imageUrl} onChange={set("imageUrl")} />
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
