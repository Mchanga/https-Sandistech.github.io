"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  MessageSquare,
  Mail,
  Star,
  ChevronDown,
  Send,
  Info,
} from "lucide-react";
import { postJSON } from "@/lib/client";
import { useStore } from "@/store/useStore";

const FAQ = [
  {
    q: "How do I create an account?",
    a: "Tap Login on the top right, then choose Register. Provide your name, email and a password to get started.",
  },
  {
    q: "Is SandisTech News free?",
    a: "Yes. Browsing news, business listings and events is completely free. Some interactive features require an account.",
  },
  {
    q: "How can I list my business?",
    a: "Contact our team through the form below and an administrator will help you get your business listed.",
  },
  {
    q: "Can I use the app offline?",
    a: "SandisTech News is a Progressive Web App — you can install it on your home screen and read cached content offline.",
  },
];

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <LifeBuoy className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-extrabold tracking-tight">Support</h1>
        </div>
        <p className="text-sm text-muted">We&apos;re here to help. Reach out anytime.</p>
      </div>

      <Link
        href="/chat"
        className="card flex items-center gap-3 p-4 transition hover:shadow-lg"
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white">
          <MessageSquare className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="font-bold">Live Community Chat</p>
          <p className="text-sm text-muted">Chat with members & admins in real time</p>
        </div>
        <span className="text-brand-600">→</span>
      </Link>

      <ContactForm />
      <FeedbackForm />

      <section>
        <h2 className="mb-3 text-lg font-extrabold">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <FaqItem key={i} {...item} />
          ))}
        </div>
      </section>

      <Link href="/about" className="card flex items-center gap-3 p-4">
        <Info className="h-5 w-5 text-brand-600" />
        <span className="font-semibold">About Us</span>
      </Link>
    </div>
  );
}

function ContactForm() {
  const { user } = useStore();
  const [form, setForm] = useState({
    name: user?.fullName ?? "",
    email: user?.email ?? "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErr("");
    try {
      await postJSON("/api/support", form);
      setStatus("done");
      setForm({ ...form, subject: "", message: "" });
    } catch (e) {
      setStatus("error");
      setErr(e instanceof Error ? e.message : "Failed to send");
    }
  }

  return (
    <section className="card p-4">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold">
        <Mail className="h-5 w-5 text-brand-600" /> Contact Us
      </h2>
      {status === "done" ? (
        <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">
          Thanks! Your message has been sent. We&apos;ll get back to you soon.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input
            className="input"
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Subject"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <textarea
            className="input min-h-[100px]"
            placeholder="Message"
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          {err && <p className="text-sm text-red-500">{err}</p>}
          <button className="btn-primary w-full" disabled={status === "sending"}>
            <Send className="h-4 w-4" />
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>
        </form>
      )}
    </section>
  );
}

function FeedbackForm() {
  const { user } = useStore();
  const [name, setName] = useState(user?.fullName ?? "");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setStatus("sending");
    try {
      await postJSON("/api/feedback", { name, rating, message });
      setStatus("done");
      setMessage("");
      setRating(0);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="card p-4">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold">
        <Star className="h-5 w-5 text-amber-500" /> Share Feedback
      </h2>
      {status === "done" ? (
        <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">
          Thank you for your feedback!
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input
            className="input"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  className={`h-7 w-7 transition ${
                    n <= (hover || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            className="input min-h-[80px]"
            placeholder="Your feedback…"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="btn-primary w-full" disabled={status === "sending" || rating === 0}>
            {status === "sending" ? "Sending…" : "Submit Feedback"}
          </button>
        </form>
      )}
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 p-4 text-left font-semibold"
      >
        {q}
        <ChevronDown className={`h-5 w-5 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-4 pb-4 text-sm text-muted">{a}</p>}
    </div>
  );
}
