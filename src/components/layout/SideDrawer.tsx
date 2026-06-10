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
  const { drawerOpen, toggleDrawer, user } = useStore();
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-200",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => toggleDrawer(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-xs flex-col bg-[rgb(var(--background))] shadow-2xl transition-transform duration-200",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link
            href="/"
            onClick={() => toggleDrawer(false)}
            className="flex items-center gap-2"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-black text-white">
              S
            </span>
            <span className="font-extrabold">
              SandisTech<span className="text-brand-600"> News</span>
            </span>
          </Link>
          <button onClick={() => toggleDrawer(false)} className="btn-ghost !px-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        {user && (
          <div className="flex items-center gap-3 border-b p-4">
            <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-brand-50 dark:bg-slate-800">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.fullName}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">
            Menu
          </p>
          {mainLinks.map((l) => (
            <DrawerLink
              key={l.href}
              {...l}
              active={pathname === l.href}
              onClick={() => toggleDrawer(false)}
            />
          ))}

          <div className="my-2 border-t" />
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">
            Account
          </p>
          {user ? (
            <>
              <DrawerLink href="/profile" label="User Profile" icon={UserIcon} active={pathname === "/profile"} onClick={() => toggleDrawer(false)} />
              <DrawerLink href="/bookmarks" label="Bookmarks" icon={Bookmark} active={pathname === "/bookmarks"} onClick={() => toggleDrawer(false)} />
              <DrawerLink href="/chat" label="Community Chat" icon={MessageSquare} active={pathname === "/chat"} onClick={() => toggleDrawer(false)} />
              <DrawerLink href="/settings" label="Settings" icon={Settings} active={pathname === "/settings"} onClick={() => toggleDrawer(false)} />
              {user.role === "admin" && (
                <DrawerLink href="/admin" label="Admin Dashboard" icon={LayoutDashboard} active={pathname.startsWith("/admin")} onClick={() => toggleDrawer(false)} />
              )}
            </>
          ) : (
            <DrawerLink href="/login" label="Login / Register" icon={LogIn} active={pathname === "/login"} onClick={() => toggleDrawer(false)} />
          )}
        </nav>

        <div className="border-t p-4 text-xs text-muted">
          © {new Date().getFullYear()} SandisTech News
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
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-brand-600 text-white"
          : "hover:bg-slate-100 dark:hover:bg-slate-800"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
