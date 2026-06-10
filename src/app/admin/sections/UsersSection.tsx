"use client";

import { useEffect, useState } from "react";
import { Trash2, Shield } from "lucide-react";
import { Spinner } from "@/components/ui/Common";
import { getJSON, patchJSON, del } from "@/lib/client";
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

  if (users === null) return <Spinner className="py-16" />;

  return (
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
  );
}
