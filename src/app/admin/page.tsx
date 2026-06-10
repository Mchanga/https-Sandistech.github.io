"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Newspaper,
  LifeBuoy,
} from "lucide-react";
import { Spinner } from "@/components/ui/Common";
import { useStore } from "@/store/useStore";
import AdminOverview from "./sections/Overview";
import AdminContent from "./sections/Content";
import AdminUsers from "./sections/UsersSection";
import AdminInbox from "./sections/Inbox";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "content", label: "Content", icon: Newspaper },
  { id: "users", label: "Users", icon: Users },
  { id: "inbox", label: "Inbox", icon: LifeBuoy },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, authLoaded } = useStore();
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (authLoaded && (!user || user.role !== "admin")) router.push("/");
  }, [authLoaded, user, router]);

  if (!authLoaded) return <Spinner className="py-20" />;
  if (!user || user.role !== "admin") return null;

  return (
    <div>
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-extrabold">
        <LayoutDashboard className="h-6 w-6 text-brand-600" /> Admin Dashboard
      </h1>
      <p className="mb-3 text-sm text-muted">Manage content, users and support.</p>

      <div className="no-scrollbar -mx-3 mb-4 flex gap-2 overflow-x-auto px-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`chip ${tab === t.id ? "chip-active" : "muted border-transparent"}`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <AdminOverview />}
      {tab === "content" && <AdminContent />}
      {tab === "users" && <AdminUsers />}
      {tab === "inbox" && <AdminInbox />}
    </div>
  );
}
