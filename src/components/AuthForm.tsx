"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { postJSON } from "@/lib/client";
import { useStore } from "@/store/useStore";
import type { SafeUser } from "@/lib/types";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { setUser } = useStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login" ? { email, password } : { fullName, email, password };
      const d = await postJSON<{ user: SafeUser }>(path, body);
      setUser(d.user);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-6">
      <div className="mb-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-2xl font-black text-white">
          S
        </span>
        <h1 className="mt-3 text-2xl font-extrabold">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-muted">
          {mode === "login"
            ? "Log in to comment, chat and bookmark."
            : "Join SandisTech News in seconds."}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && (
          <Field icon={<User className="h-4 w-4" />}>
            <input
              className="w-full bg-transparent outline-none"
              placeholder="Full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>
        )}
        <Field icon={<Mail className="h-4 w-4" />}>
          <input
            className="w-full bg-transparent outline-none"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field icon={<Lock className="h-4 w-4" />}>
          <input
            className="w-full bg-transparent outline-none"
            type="password"
            placeholder="Password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        {mode === "login" && (
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-brand-600"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <button className="btn-primary w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="font-semibold text-brand-600">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-600">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Field({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border px-3 py-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
      <span className="text-muted">{icon}</span>
      {children}
    </div>
  );
}
