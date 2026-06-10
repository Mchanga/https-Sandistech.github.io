"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Bell, CheckCheck, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { getJSON, patchJSON } from "@/lib/client";
import { timeAgo } from "@/lib/utils";
import type { NotificationItem } from "@/lib/types";

export default function NotificationsPanel() {
  const { notificationsOpen, toggleNotifications, user, setUnread } = useStore();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!notificationsOpen || !user) return;
    setLoading(true);
    getJSON<{ notifications: NotificationItem[]; unread: number }>(
      "/api/notifications"
    )
      .then((d) => {
        setItems(d.notifications);
        setUnread(d.unread);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [notificationsOpen, user, setUnread]);

  async function markAll() {
    await patchJSON("/api/notifications", { all: true }).catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  }

  if (!notificationsOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-black/40" onClick={() => toggleNotifications(false)} />
      <div className="fixed inset-y-0 right-0 z-[60] flex w-[88%] max-w-sm flex-col bg-[rgb(var(--background))] shadow-2xl animate-slide-in">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Bell className="h-5 w-5" /> Notifications
          </div>
          <div className="flex items-center gap-1">
            <button onClick={markAll} className="btn-ghost !px-2" title="Mark all read">
              <CheckCheck className="h-5 w-5" />
            </button>
            <button onClick={() => toggleNotifications(false)} className="btn-ghost !px-2">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {!user && (
            <div className="py-16 text-center text-muted">
              <p>Please log in to view notifications.</p>
              <Link href="/login" onClick={() => toggleNotifications(false)} className="btn-primary mt-3">
                Login
              </Link>
            </div>
          )}
          {user && loading && (
            <div className="flex justify-center py-10 text-muted">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {user && !loading && items.length === 0 && (
            <p className="py-16 text-center text-muted">You&apos;re all caught up.</p>
          )}
          {user &&
            items.map((n) => (
              <div
                key={n.id}
                className={`mb-2 rounded-xl border p-3 ${
                  n.isRead ? "opacity-70" : "border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-muted">{timeAgo(n.createdAt)}</span>
                </div>
                {n.content && <p className="mt-1 text-sm text-muted">{n.content}</p>}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
