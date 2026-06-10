"use client";

import { useEffect, useState } from "react";
import { Star, LifeBuoy, Send } from "lucide-react";
import { Spinner } from "@/components/ui/Common";
import { getJSON, patchJSON } from "@/lib/client";
import { timeAgo } from "@/lib/utils";

interface SupportTicket {
  id: number;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  name: string | null;
  email: string | null;
  createdAt: string;
}
interface FeedbackItem {
  id: number;
  name: string | null;
  rating: number;
  message: string;
  createdAt: string;
}

export default function AdminInbox() {
  const [sub, setSub] = useState<"support" | "feedback">("support");
  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSub("support")}
          className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${sub === "support" ? "border-brand-600 bg-brand-600 text-white" : "muted border-transparent"}`}
        >
          <LifeBuoy className="mr-1 inline h-4 w-4" /> Support
        </button>
        <button
          onClick={() => setSub("feedback")}
          className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${sub === "feedback" ? "border-brand-600 bg-brand-600 text-white" : "muted border-transparent"}`}
        >
          <Star className="mr-1 inline h-4 w-4" /> Feedback
        </button>
      </div>
      {sub === "support" ? <SupportList /> : <FeedbackList />}
    </div>
  );
}

function SupportList() {
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);

  useEffect(() => {
    getJSON<{ tickets: SupportTicket[] }>("/api/support")
      .then((d) => setTickets(d.tickets))
      .catch(() => setTickets([]));
  }, []);

  async function reply(id: number, text: string) {
    await patchJSON("/api/support", { id, reply: text, status: "closed" }).catch(() => {});
    setTickets((prev) => prev?.map((t) => (t.id === id ? { ...t, reply: text, status: "closed" } : t)) ?? null);
  }

  if (tickets === null) return <Spinner className="py-16" />;
  if (tickets.length === 0)
    return <p className="py-10 text-center text-sm text-muted">No support tickets.</p>;

  return (
    <div className="space-y-3">
      {tickets.map((t) => (
        <TicketCard key={t.id} ticket={t} onReply={reply} />
      ))}
    </div>
  );
}

function TicketCard({
  ticket,
  onReply,
}: {
  ticket: SupportTicket;
  onReply: (id: number, text: string) => void;
}) {
  const [text, setText] = useState(ticket.reply ?? "");
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="font-bold">{ticket.subject}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            ticket.status === "closed"
              ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          }`}
        >
          {ticket.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">
        {ticket.name ?? "Guest"} · {ticket.email} · {timeAgo(ticket.createdAt)}
      </p>
      <p className="mt-2 text-sm">{ticket.message}</p>
      <div className="mt-3 flex gap-2">
        <input
          className="input"
          placeholder="Write a reply…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={() => onReply(ticket.id, text)} className="btn-primary !px-3" disabled={!text.trim()}>
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function FeedbackList() {
  const [items, setItems] = useState<FeedbackItem[] | null>(null);

  useEffect(() => {
    getJSON<{ feedback: FeedbackItem[] }>("/api/feedback")
      .then((d) => setItems(d.feedback))
      .catch(() => setItems([]));
  }, []);

  if (items === null) return <Spinner className="py-16" />;
  if (items.length === 0)
    return <p className="py-10 text-center text-sm text-muted">No feedback yet.</p>;

  return (
    <div className="space-y-3">
      {items.map((f) => (
        <div key={f.id} className="card p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{f.name ?? "Anonymous"}</p>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < f.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
                />
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-muted">{timeAgo(f.createdAt)}</p>
          <p className="mt-2 text-sm">{f.message}</p>
        </div>
      ))}
    </div>
  );
}
