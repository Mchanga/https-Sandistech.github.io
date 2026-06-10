"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, Mic, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { getJSON } from "@/lib/client";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import type { Business, EventItem } from "@/lib/types";

interface SearchResults {
  posts: { id: number; title: string; slug: string; category: string; type: string }[];
  businesses: Business[];
  events: EventItem[];
}

export default function SearchOverlay() {
  const { searchOpen, toggleSearch } = useStore();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { supported, listening, start } = useVoiceSearch((text) => setQ(text));

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else {
      setQ("");
      setResults(null);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      getJSON<SearchResults>(`/api/search?q=${encodeURIComponent(q)}`)
        .then(setResults)
        .catch(() => setResults(null))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  if (!searchOpen) return null;

  const empty =
    results &&
    results.posts.length === 0 &&
    results.businesses.length === 0 &&
    results.events.length === 0;

  return (
    <div className="fixed inset-0 z-[60] bg-[rgb(var(--background))]">
      <div className="mx-auto max-w-3xl">
        <div className="flex h-14 items-center gap-2 border-b px-3">
          <Search className="h-5 w-5 text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search news, businesses, events…"
            className="h-full flex-1 bg-transparent text-base outline-none"
          />
          {supported && (
            <button
              onClick={start}
              aria-label="Voice search"
              className={`btn-ghost !px-2 ${listening ? "text-red-500" : ""}`}
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
          <button onClick={() => toggleSearch(false)} className="btn-ghost !px-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
          {listening && (
            <p className="mb-3 text-sm text-brand-600">Listening… speak now</p>
          )}
          {loading && (
            <div className="flex justify-center py-10 text-muted">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {!loading && !results && (
            <p className="py-10 text-center text-muted">
              Type to search across the platform.
            </p>
          )}
          {!loading && empty && (
            <p className="py-10 text-center text-muted">No results for “{q}”.</p>
          )}

          {results && results.posts.length > 0 && (
            <Section title="Posts">
              {results.posts.map((p) => (
                <ResultRow
                  key={`p-${p.id}`}
                  href={`/post/${p.slug}`}
                  title={p.title}
                  subtitle={`${p.type} · ${p.category}`}
                  onClick={() => toggleSearch(false)}
                />
              ))}
            </Section>
          )}
          {results && results.businesses.length > 0 && (
            <Section title="Businesses">
              {results.businesses.map((b) => (
                <ResultRow
                  key={`b-${b.id}`}
                  href="/business"
                  title={b.name}
                  subtitle={b.category}
                  onClick={() => toggleSearch(false)}
                />
              ))}
            </Section>
          )}
          {results && results.events.length > 0 && (
            <Section title="Events">
              {results.events.map((e) => (
                <ResultRow
                  key={`e-${e.id}`}
                  href={`/events/${e.id}`}
                  title={e.title}
                  subtitle={e.category}
                  onClick={() => toggleSearch(false)}
                />
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ResultRow({
  href,
  title,
  subtitle,
  onClick,
}: {
  href: string;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-xl px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <p className="font-medium">{title}</p>
      <p className="text-xs capitalize text-muted">{subtitle}</p>
    </Link>
  );
}
