"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Star, Briefcase, ArrowRight } from "lucide-react";
import type { Business } from "@/lib/types";

function digits(s?: string | null) {
  return (s || "").replace(/[^0-9]/g, "");
}

export default function BusinessCard({ business: b }: { business: Business }) {
  const wa = digits(b.whatsapp || b.phone);
  const tel = digits(b.phone || b.whatsapp);
  return (
    <div className="card-soft overflow-hidden animate-fade-in">
      <div className="flex gap-3 p-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-50 dark:bg-slate-800">
          {b.logo || b.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={(b.logo || b.imageUrl) as string} alt={b.name} className="h-full w-full object-cover" />
          ) : (
            <Briefcase className="h-7 w-7 text-brand-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold">{b.name}</h3>
          <p className="truncate text-xs font-medium text-brand-600">{b.category}</p>
          {b.location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5" /> {b.location}
            </p>
          )}
          {b.rating > 0 && (
            <p className="mt-0.5 flex items-center gap-1 text-xs">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{b.rating.toFixed(1)}</span>
              <span className="text-muted">({b.reviews})</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-3">
        {tel && (
          <a
            href={`tel:${tel}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
          >
            <Phone className="h-4 w-4" /> Call
          </a>
        )}
        {wa && (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
          >
            <WhatsAppIcon className="h-4 w-4" /> Chat
          </a>
        )}
        {b.email && (
          <a
            href={`mailto:${b.email}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
          >
            <Mail className="h-4 w-4" /> Email
          </a>
        )}
      </div>

      <Link
        href={`/business/${b.id}`}
        className="mt-3 flex items-center justify-center gap-1 border-t py-2.5 text-sm font-semibold text-brand-600"
      >
        View Details <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.824 11.824 0 013.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.728-.979c.485.287.948.541 1.249.722zm5.413-13.785c-.232-.516-.476-.526-.696-.535l-.594-.007c-.207 0-.543.078-.827.39-.284.311-1.085 1.06-1.085 2.586 0 1.526 1.111 3.001 1.266 3.209.155.207 2.158 3.456 5.331 4.715 2.638 1.047 3.176.839 3.749.786.573-.052 1.847-.755 2.107-1.484.26-.729.26-1.354.182-1.484-.078-.13-.285-.208-.594-.364-.31-.155-1.847-.911-2.133-1.015-.286-.104-.495-.156-.703.157-.208.312-.806 1.014-.988 1.222-.182.209-.365.235-.677.079-.312-.156-1.318-.486-2.51-1.549-.927-.827-1.554-1.849-1.737-2.161-.182-.312-.019-.481.137-.637.14-.139.312-.364.468-.546.156-.182.208-.312.312-.52.104-.209.052-.391-.026-.547-.078-.156-.683-1.694-.961-2.314z" />
    </svg>
  );
}
