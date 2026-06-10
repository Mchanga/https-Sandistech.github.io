"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Briefcase,
} from "lucide-react";
import { Spinner } from "@/components/ui/Common";
import { WhatsAppIcon } from "@/components/BusinessCard";
import { getJSON } from "@/lib/client";
import type { Business } from "@/lib/types";

function digits(s?: string | null) {
  return (s || "").replace(/[^0-9]/g, "");
}

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [b, setB] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getJSON<{ business: Business | null }>(`/api/businesses/${id}`)
      .then((d) => {
        if (!d.business) setError("Business not found");
        else setB(d.business);
      })
      .catch(() => setError("Business not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner className="py-20" />;
  if (error || !b)
    return <p className="py-20 text-center text-muted">{error || "Not found"}</p>;

  const wa = digits(b.whatsapp || b.phone);
  const tel = digits(b.phone || b.whatsapp);

  return (
    <div className="animate-fade-in">
      <button onClick={() => router.back()} className="btn-ghost mb-3 !px-2">
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      {/* Banner + logo */}
      <div className="relative mb-10 overflow-hidden rounded-2xl">
        {b.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.imageUrl} alt={b.name} className="aspect-[16/9] w-full object-cover" />
        ) : (
          <div className="aspect-[16/9] w-full bg-gradient-to-br from-brand-600 to-emerald-600" />
        )}
        <div className="absolute -bottom-8 left-4 grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border-4 border-[rgb(var(--background))] bg-brand-50 dark:bg-slate-800">
          {b.logo || b.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={(b.logo || b.imageUrl) as string} alt={b.name} className="h-full w-full object-cover" />
          ) : (
            <Briefcase className="h-8 w-8 text-brand-600" />
          )}
        </div>
      </div>

      <h1 className="text-2xl font-extrabold">{b.name}</h1>
      <p className="text-sm font-medium text-brand-600">{b.category}</p>
      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
        {b.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {b.location}
          </span>
        )}
        {b.rating > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-[rgb(var(--foreground))]">
              {b.rating.toFixed(1)}
            </span>
            ({b.reviews} reviews)
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {tel && (
          <a
            href={`tel:${tel}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <Phone className="h-4 w-4" /> Call
          </a>
        )}
        {wa && (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
        )}
        {b.email && (
          <a
            href={`mailto:${b.email}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Mail className="h-4 w-4" /> Email
          </a>
        )}
      </div>

      {b.description && (
        <section className="mt-6">
          <h2 className="mb-2 text-lg font-extrabold">About Business</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
            {b.description}
          </p>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-extrabold">Contact Information</h2>
        <div className="card-soft divide-y">
          {b.phone && <ContactRow icon={<Phone className="h-4 w-4" />} label="Phone" value={b.phone} href={`tel:${tel}`} />}
          {b.email && <ContactRow icon={<Mail className="h-4 w-4" />} label="Email" value={b.email} href={`mailto:${b.email}`} />}
          {b.location && <ContactRow icon={<MapPin className="h-4 w-4" />} label="Location" value={b.location} />}
          {b.website && (
            <ContactRow
              icon={<Globe className="h-4 w-4" />}
              label="Website"
              value={b.website}
              href={b.website.startsWith("http") ? b.website : `https://${b.website}`}
            />
          )}
        </div>
      </section>

      {b.location && (
        <section className="mt-6">
          <h2 className="mb-2 text-lg font-extrabold">Location</h2>
          <iframe
            title="map"
            className="aspect-[16/10] w-full rounded-2xl border"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(b.location)}&output=embed`}
          />
        </section>
      )}
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 p-3">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-slate-800">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
        {content}
      </a>
    );
  return content;
}
