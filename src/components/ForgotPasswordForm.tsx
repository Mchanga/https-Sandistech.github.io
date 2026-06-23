"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { postJSON } from "@/lib/client";
import PasswordToggleInput from "@/components/PasswordToggleInput";

type Step = "request" | "reset" | "done";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function requestToken(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const d = await postJSON<{ found: boolean; token?: string; message?: string }>(
        "/api/auth/forgot-password",
        { email }
      );
      if (!d.found || !d.token) {
        setError(d.message || "No account found with that email.");
        return;
      }
      setToken(d.token);
      setStep("reset");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await postJSON("/api/auth/reset-password", { token, password });
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-6">
      <div className="mb-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white">
          <KeyRound className="h-6 w-6" />
        </span>
        <h1 className="mt-3 text-2xl font-extrabold">Reset password</h1>
        <p className="text-sm text-muted">
          {step === "request" && "Enter your account email to start."}
          {step === "reset" && "Choose a new password for your account."}
          {step === "done" && "Your password has been updated."}
        </p>
      </div>

      {step === "request" && (
        <form onSubmit={requestToken} className="space-y-3">
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
          {error && <ErrorBox>{error}</ErrorBox>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={resetPassword} className="space-y-3">
          <Field icon={<Lock className="h-4 w-4" />}>
            <PasswordToggleInput
              value={password}
              onChange={setPassword}
              placeholder="New password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </Field>
          <Field icon={<Lock className="h-4 w-4" />}>
            <PasswordToggleInput
              value={confirm}
              onChange={setConfirm}
              placeholder="Confirm new password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </Field>
          {error && <ErrorBox>{error}</ErrorBox>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <button className="btn-primary w-full" onClick={() => router.push("/login")}>
            Back to login
          </button>
        </div>
      )}

      {step !== "done" && (
        <p className="mt-4 text-center text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-brand-600">
            Log in
          </Link>
        </p>
      )}
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

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
      {children}
    </p>
  );
}
