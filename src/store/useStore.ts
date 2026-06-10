"use client";

import { create } from "zustand";
import type { SafeUser } from "@/lib/types";

interface AppState {
  // auth
  user: SafeUser | null;
  authLoaded: boolean;
  setUser: (user: SafeUser | null) => void;
  setAuthLoaded: (v: boolean) => void;

  // ui
  drawerOpen: boolean;
  searchOpen: boolean;
  notificationsOpen: boolean;
  toggleDrawer: (v?: boolean) => void;
  toggleSearch: (v?: boolean) => void;
  toggleNotifications: (v?: boolean) => void;

  // notifications badge
  unread: number;
  setUnread: (n: number) => void;

  // theme
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  authLoaded: false,
  setUser: (user) => set({ user }),
  setAuthLoaded: (v) => set({ authLoaded: v }),

  drawerOpen: false,
  searchOpen: false,
  notificationsOpen: false,
  toggleDrawer: (v) => set((s) => ({ drawerOpen: v ?? !s.drawerOpen })),
  toggleSearch: (v) => set((s) => ({ searchOpen: v ?? !s.searchOpen })),
  toggleNotifications: (v) =>
    set((s) => ({ notificationsOpen: v ?? !s.notificationsOpen })),

  unread: 0,
  setUnread: (n) => set({ unread: n }),

  theme: "light",
  setTheme: (t) => {
    set({ theme: t });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", t === "dark");
      localStorage.setItem("theme", t);
    }
  },
  toggleTheme: () =>
    set((s) => {
      const t = s.theme === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", t === "dark");
        localStorage.setItem("theme", t);
      }
      return { theme: t };
    }),
}));
