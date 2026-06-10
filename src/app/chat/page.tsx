"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Hash, Users, Circle, MessageSquare } from "lucide-react";
import { Spinner } from "@/components/ui/Common";
import { getJSON } from "@/lib/client";
import { useStore } from "@/store/useStore";
import { useSocket } from "@/hooks/useSocket";
import { timeAgo } from "@/lib/utils";
import type { ChatRoom, ChatMessageItem } from "@/lib/types";

export default function ChatPage() {
  const { user, authLoaded } = useStore();
  const { socket, connected } = useSocket(!!user);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load rooms
  useEffect(() => {
    if (!user) return;
    getJSON<{ rooms: ChatRoom[] }>("/api/chat/rooms")
      .then((d) => {
        setRooms(d.rooms);
        if (d.rooms[0]) setActiveRoom(d.rooms[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  // load history when room changes
  useEffect(() => {
    if (!activeRoom) return;
    getJSON<{ messages: ChatMessageItem[] }>(
      `/api/chat/rooms/${activeRoom}/messages`
    )
      .then((d) => setMessages(d.messages))
      .catch(() => setMessages([]));
  }, [activeRoom]);

  // socket listeners
  useEffect(() => {
    const s = socket.current;
    if (!s || !activeRoom) return;
    s.emit("join_room", activeRoom);
    setTypingUsers([]);

    const onMessage = (m: ChatMessageItem) => {
      if (m.roomId === activeRoom) setMessages((prev) => [...prev, m]);
    };
    const onPresence = (p: { online: number[] }) => setOnlineCount(p.online.length);
    const onTyping = (t: { userName: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        if (t.isTyping) return Array.from(new Set([...prev, t.userName]));
        return prev.filter((u) => u !== t.userName);
      });
    };

    s.on("message", onMessage);
    s.on("presence", onPresence);
    s.on("typing", onTyping);
    return () => {
      s.off("message", onMessage);
      s.off("presence", onPresence);
      s.off("typing", onTyping);
    };
  }, [socket, activeRoom, connected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const s = socket.current;
    if (!s || !activeRoom || !input.trim()) return;
    s.emit("message", { roomId: activeRoom, message: input.trim() });
    s.emit("typing", { roomId: activeRoom, isTyping: false });
    setInput("");
  }

  function onType(v: string) {
    setInput(v);
    const s = socket.current;
    if (!s || !activeRoom) return;
    s.emit("typing", { roomId: activeRoom, isTyping: true });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(
      () => s.emit("typing", { roomId: activeRoom, isTyping: false }),
      1500
    );
  }

  if (authLoaded && !user)
    return (
      <div className="py-20 text-center">
        <MessageSquare className="mx-auto h-10 w-10 text-muted" />
        <p className="mt-3 font-semibold">Community Chat is for members</p>
        <p className="text-sm text-muted">Log in to chat in real time.</p>
        <Link href="/login" className="btn-primary mt-4">
          Login
        </Link>
      </div>
    );

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Community Chat</h1>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Circle className={`h-2.5 w-2.5 ${connected ? "fill-green-500 text-green-500" : "fill-slate-400 text-slate-400"}`} />
          <Users className="h-4 w-4" /> {onlineCount} online
        </span>
      </div>

      <div className="no-scrollbar -mx-3 mb-2 flex gap-2 overflow-x-auto px-3">
        {rooms.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveRoom(r.id)}
            className={`chip ${activeRoom === r.id ? "chip-active" : "muted border-transparent"}`}
          >
            <Hash className="h-3.5 w-3.5" /> {r.name}
          </button>
        ))}
      </div>

      <div className="card flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">
            No messages yet — say hi! 👋
          </p>
        )}
        {messages.map((m) => {
          const mine = m.userId === user?.id;
          return (
            <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full muted">
                {m.userAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.userAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold">{(m.userName ?? "U")[0]}</span>
                )}
              </div>
              <div className={`max-w-[75%] ${mine ? "text-right" : ""}`}>
                <div className="flex items-center gap-1 text-[11px] text-muted">
                  <span className="font-semibold">{mine ? "You" : m.userName}</span>
                  <span>· {timeAgo(m.createdAt)}</span>
                </div>
                <div
                  className={`mt-0.5 inline-block rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-brand-600 text-white" : "muted"
                  }`}
                >
                  {m.message}
                </div>
              </div>
            </div>
          );
        })}
        {typingUsers.length > 0 && (
          <p className="text-xs italic text-muted">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing…
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="mt-2 flex gap-2">
        <input
          className="input"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => onType(e.target.value)}
        />
        <button className="btn-primary !px-4" disabled={!connected}>
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
