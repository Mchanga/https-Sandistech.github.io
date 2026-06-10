"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { getJSON } from "@/lib/client";
import type { SafeUser } from "@/lib/types";

export default function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, setAuthLoaded, setTheme, setUnread, user } = useStore();

  // Initialise theme from localStorage / system preference
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(saved ?? (prefersDark ? "dark" : "light"));
  }, [setTheme]);

  // Load current user
  useEffect(() => {
    getJSON<{ user: SafeUser | null }>("/api/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setAuthLoaded(true));
  }, [setUser, setAuthLoaded]);

  // Poll notifications for logged-in users
  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    let active = true;
    const load = () =>
      getJSON<{ unread: number }>("/api/notifications")
        .then((d) => active && setUnread(d.unread))
        .catch(() => {});
    load();
    const t = setInterval(load, 20000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [user, setUnread]);

  return <>{children}</>;
}
