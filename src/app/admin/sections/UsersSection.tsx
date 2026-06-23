"use client";

import { useEffect, useState } from "react";
import { Trash2, Shield, UserPlus, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/Common";
import { getJSON, postJSON, patchJSON, del } from "@/lib/client";
import { useStore } from "@/store/useStore";
import type { SafeUser } from "@/lib/types";

export default function AdminUsers() {
  const { user: me } = useStore();
  const [users, setUsers] = useState<SafeUser[] | null>(null);

  useEffect(() => {
    getJSON<{ users: SafeUser[] }>("/api/admin/users")
      .then((d) => setUsers(d.users))
      .catch(() => setUsers([]));
  }, []);

  async function changeRole(id: number, role: string) {
    await patchJSON("/api/admin/users", { id, role }).catch(() => {});
    setUsers((prev) => prev?.map((u) => (u.id === id ? { ...u, role: role as SafeUser["role"] } : u)) ?? null);
  }

  async function remove(id: number) {
    if (!confirm("Delete this user?")) return;
    await del(`/api/admin/users?id=${id}`).catch(() => {});
    setUsers((prev) => prev?.filter((u) => u.id !== id) ?? null);
  }

  function onCreated(u: SafeUser) {
    setUsers((prev) => [u, ...(prev ?? [])]);
  }

  if (users === null) return <Spinner className="py-16" />;

  return (
    <div className="space-y-4">
      <AddAdminForm onCreated={onCreated} />
      <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="card flex items-center gap-3 p-3">
          <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full muted">
            {u.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-bold">{u.fullName[0]}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{u.fullName}</p>
            <p className="truncate text-xs text-muted">{u.email}</p>
          </div>
          <select
            value={u.role}
            onChange={(e) => changeRole(u.id, e.target.value)}
            disabled={u.id === me?.id}
            className="rounded-lg border bg-transparent px-2 py-1.5 text-xs font-semibold"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={() => remove(u.id)}
            disabled={u.id === me?.id}
            className="btn-ghost !px-2 text-red-500 disabled:opacity-30"
            aria-label="Delete user"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      {users.length === 0 && (
        <p className="py-10 text-center text-sm text-muted">
          <Shield className="mx-auto mb-2 h-6 w-6" /> No users found.
        </p>
      )}
      </div>
    </div>
  );
}

function AddAdminForm({ onCreated }: { onCreated: (u: SafeUser) => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ fullName: "", email: "", password: "", role: "admin" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");
    try {
      const { user } = await postJSON<{ user: SafeUser }>("/api/admin/users", f);
      onCreated(user);
      setF({ fullName: "", email: "", password: "", role: "admin" });
      setOpen(false);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to create");
    }
  }

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="btn-primary w-full">
        <UserPlus className="h-4 w-4" /> Add Admin / User
      </button>
    );

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <p className="flex items-center gap-2 font-bold">
        <UserPlus className="h-4 w-4 text-brand-600" /> Create account
      </p>
      <input className="input" placeholder="Full name" required value={f.fullName} onChange={set("fullName")} />
      <input className="input" type="email" placeholder="Email" required value={f.email} onChange={set("email")} />
      <div className="relative">
        <input
          className="input pr-10"
          type={showPassword ? "text" : "password"}
          placeholder="Password (min 6 chars)"
          required
          minLength={6}
          value={f.password}
          onChange={set("password")}
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <select className="input" value={f.role} onChange={set("role")}>
        <option value="admin">Administrator</option>
        <option value="user">Registered user</option>
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={status === "saving"} className="btn-primary flex-1">
          {status === "saving" ? "Creating…" : "Create"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
