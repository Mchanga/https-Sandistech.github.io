"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User as UserIcon, Award, Bookmark, MessageSquare, Save } from "lucide-react";
import { Spinner } from "@/components/ui/Common";
import { useStore } from "@/store/useStore";
import { patchJSON } from "@/lib/client";
import type { SafeUser } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, authLoaded, setUser } = useStore();
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (authLoaded && !user) router.push("/login");
    if (user) {
      setFullName(user.fullName);
      setBio(user.bio ?? "");
      setAvatar(user.avatar ?? "");
    }
  }, [user, authLoaded, router]);

  if (!authLoaded) return <Spinner className="py-20" />;
  if (!user) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const d = await patchJSON<{ user: SafeUser }>("/api/profile", {
        fullName,
        bio,
        avatar,
      });
      setUser(d.user);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      <div className="card flex flex-col items-center p-6 text-center">
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-brand-50 dark:bg-slate-800">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={user.fullName} className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-9 w-9" />
          )}
        </div>
        <h1 className="mt-3 text-xl font-extrabold">{user.fullName}</h1>
        <p className="text-sm text-muted">{user.email}</p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          <Award className="h-3.5 w-3.5" /> {user.role}
        </span>
        <p className="mt-2 text-xs text-muted">Member since {memberSince}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/bookmarks" className="card flex items-center gap-3 p-4">
          <Bookmark className="h-6 w-6 text-brand-600" />
          <div>
            <p className="font-bold">Bookmarks</p>
            <p className="text-xs text-muted">Saved posts</p>
          </div>
        </Link>
        <Link href="/chat" className="card flex items-center gap-3 p-4">
          <MessageSquare className="h-6 w-6 text-brand-600" />
          <div>
            <p className="font-bold">Chat</p>
            <p className="text-xs text-muted">Community</p>
          </div>
        </Link>
      </div>

      <form onSubmit={save} className="card space-y-3 p-4">
        <h2 className="font-bold">Edit profile</h2>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Full name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Avatar URL</label>
          <input className="input" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Bio</label>
          <textarea className="input min-h-[80px]" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" />
        </div>
        {saved && <p className="text-sm text-green-600">Profile updated.</p>}
        <button className="btn-primary w-full" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
