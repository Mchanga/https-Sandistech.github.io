"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Moon, Sun, LogOut, Bell, Shield, Palette } from "lucide-react";
import { Spinner } from "@/components/ui/Common";
import { useStore } from "@/store/useStore";
import { postJSON } from "@/lib/client";

export default function SettingsPage() {
  const router = useRouter();
  const { user, authLoaded, setUser, theme, toggleTheme } = useStore();

  useEffect(() => {
    if (authLoaded && !user) router.push("/login");
  }, [authLoaded, user, router]);

  if (!authLoaded) return <Spinner className="py-20" />;
  if (!user) return null;

  async function logout() {
    await postJSON("/api/auth/logout", {}).catch(() => {});
    setUser(null);
    router.push("/");
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Settings</h1>

      <section className="card divide-y">
        <Row icon={<Palette className="h-5 w-5" />} title="Appearance" subtitle="Light or dark theme">
          <button onClick={toggleTheme} className="btn-ghost border !py-2">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </Row>
        <Row icon={<Bell className="h-5 w-5" />} title="Notifications" subtitle="In-app alerts">
          <span className="text-sm text-muted">Enabled</span>
        </Row>
        <Row icon={<Shield className="h-5 w-5" />} title="Account" subtitle={user.email}>
          <Link href="/profile" className="btn-ghost border !py-2 text-sm">
            Edit
          </Link>
        </Row>
      </section>

      <button onClick={logout} className="btn-ghost w-full border text-red-600">
        <LogOut className="h-4 w-4" /> Log out
      </button>

      <p className="text-center text-xs text-muted">SandisTech News · v1.0.0</p>
    </div>
  );
}

function Row({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <span className="text-brand-600">{icon}</span>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
