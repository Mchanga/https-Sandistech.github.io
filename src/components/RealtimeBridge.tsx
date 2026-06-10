"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useSocket } from "@/hooks/useSocket";
import { getJSON } from "@/lib/client";
import type { PostListItem } from "@/lib/types";

/**
 * Bridges Socket.io events to the rest of the app:
 * - "new_post"      → dispatches a window event consumed by the Home/News feeds
 * - "notification"  → refreshes the unread notification badge
 */
export default function RealtimeBridge() {
  const { user, setUnread } = useStore();
  const { socket, connected } = useSocket(!!user);

  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    const onNewPost = (post: PostListItem) => {
      window.dispatchEvent(new CustomEvent("sandistech:new_post", { detail: post }));
    };
    const onNotification = () => {
      getJSON<{ unread: number }>("/api/notifications")
        .then((d) => setUnread(d.unread))
        .catch(() => {});
    };

    s.on("new_post", onNewPost);
    s.on("notification", onNotification);
    return () => {
      s.off("new_post", onNewPost);
      s.off("notification", onNotification);
    };
  }, [socket, connected, setUnread]);

  return null;
}
