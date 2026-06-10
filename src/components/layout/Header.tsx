"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Settings,
  Bookmark,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { postJSON } from "@/lib/client";
import { Logo } from "@/components/ui/Common";

export default function Header() {
  const router = useRouter();
  const {
    toggleDrawer,
    toggleSearch,
    toggleNotifications,
    theme,
    toggleTheme,
    user,
    setUser,
    unread,
  } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await postJSON("/api/auth/logout", {}).catch(() => {});
    setUser(null);
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-[rgb(var(--background))]/85 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3">
        <button
          aria-label="Open menu"
          onClick={() => toggleDrawer(true)}
          className="btn-ghost !px-2"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Logo className="mr-1" />

        {/* Desktop centered search */}
        <button
          onClick={() => toggleSearch(true)}
          className="mx-auto hidden h-9 w-full max-w-md items-center gap-2 rounded-xl border muted px-3 text-left text-sm text-muted md:flex"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1">Search news, business, events…</span>
        </button>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button
            aria-label="Search"
            onClick={() => toggleSearch(true)}
            className="btn-ghost !px-2 md:hidden"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="btn-ghost !px-2"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <button
            aria-label="Notifications"
            onClick={() => toggleNotifications(true)}
            className="btn-ghost relative !px-2"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

        {user ? (
          <div className="relative">
            <button
              aria-label="Profile menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="ml-1 flex items-center gap-2"
            >
              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border bg-brand-50 dark:bg-slate-800">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
              </span>
              <span className="hidden text-left leading-tight lg:block">
                <span className="block text-sm font-semibold">{user.fullName}</span>
                <span className="block text-xs capitalize text-muted">{user.role}</span>
              </span>
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="card absolute right-0 z-50 mt-2 w-56 overflow-hidden p-1 shadow-xl animate-fade-in">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold">{user.fullName}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                      {user.role}
                    </span>
                  </div>
                  <div className="my-1 border-t" />
                  <MenuLink href="/profile" icon={<UserIcon className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                    Profile
                  </MenuLink>
                  <MenuLink href="/bookmarks" icon={<Bookmark className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                    Bookmarks
                  </MenuLink>
                  <MenuLink href="/settings" icon={<Settings className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                    Settings
                  </MenuLink>
                  {user.role === "admin" && (
                    <MenuLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                      Admin Dashboard
                    </MenuLink>
                  )}
                  <div className="my-1 border-t" />
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link href="/login" className="btn-primary ml-1 !px-3 !py-2 text-sm">
            Login
          </Link>
        )}
        </div>
      </div>
    </header>
  );
}

function MenuLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {icon}
      {children}
    </Link>
  );
}
