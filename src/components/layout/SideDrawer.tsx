"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Newspaper,
  Briefcase,
  Calendar,
  LifeBuoy,
  Info,
  LogIn,
  User as UserIcon,
  Settings,
  X,
  LayoutDashboard,
  MessageSquare,
  Bookmark,
  Moon,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const mainLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/business", label: "Business", icon: Briefcase },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/about", label: "About Us", icon: Info },
];

export default function SideDrawer() {
  const { drawerOpen, toggleDrawer, user, theme, toggleTheme } = useStore();
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 transition-opacity duration-200",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => toggleDrawer(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-xs flex-col bg-slate-900 text-slate-100 shadow-2xl transition-transform duration-200",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link
            href="/"
            onClick={() => toggleDrawer(false)}
            className="flex items-center gap-1.5"
          >
            <span className="text-lg font-extrabold tracking-tight text-brand-400">
              SandisTech
            </span>
            <span className="logo-badge">News</span>
          </Link>
          <button
            onClick={() => toggleDrawer(false)}
            className="grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {user && (
          <div className="mx-3 mb-2 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-brand-600">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.fullName}</p>
              <p className="truncate text-xs capitalize text-slate-400">{user.role}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {mainLinks.map((l) => (
            <DrawerLink
              key={l.href}
              {...l}
              active={pathname === l.href}
              onClick={() => toggleDrawer(false)}
            />
          ))}

          <div className="my-3 border-t border-white/10" />

          {user ? (
            <>
              <DrawerLink href="/profile" label="User Profile" icon={UserIcon} active={pathname === "/profile"} onClick={() => toggleDrawer(false)} />
              <DrawerLink href="/bookmarks" label="Bookmarks" icon={Bookmark} active={pathname === "/bookmarks"} onClick={() => toggleDrawer(false)} />
              <DrawerLink href="/chat" label="Live Chat" icon={MessageSquare} active={pathname === "/chat"} onClick={() => toggleDrawer(false)} />
              <DrawerLink href="/settings" label="Settings" icon={Settings} active={pathname === "/settings"} onClick={() => toggleDrawer(false)} />
              {user.role === "admin" && (
                <DrawerLink href="/admin" label="Admin Dashboard" icon={LayoutDashboard} active={pathname.startsWith("/admin")} onClick={() => toggleDrawer(false)} />
              )}
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => toggleDrawer(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-brand-400 transition hover:bg-white/5"
            >
              <LogIn className="h-5 w-5" /> Login / Register
            </Link>
          )}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-xl px-2 py-1.5"
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <Moon className="h-5 w-5" /> Dark Mode
            </span>
            <span
              className={cn(
                "relative h-6 w-11 rounded-full transition",
                theme === "dark" ? "bg-brand-500" : "bg-slate-600"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white transition",
                  theme === "dark" ? "left-[22px]" : "left-0.5"
                )}
              />
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

function DrawerLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
        active ? "bg-brand-600 text-white" : "text-slate-200 hover:bg-white/5"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
