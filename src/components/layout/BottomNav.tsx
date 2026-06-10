"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, Briefcase, Calendar, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/business", label: "Business", icon: Briefcase },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/support", label: "Support", icon: LifeBuoy },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-[rgb(var(--background))]/90 backdrop-blur-lg md:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-5">
        {tabs.map((t) => {
          const active = pathname === t.href;
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition",
                active ? "text-brand-600" : "text-muted"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "scale-110")} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
