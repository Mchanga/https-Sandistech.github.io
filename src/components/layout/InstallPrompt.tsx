"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa_install_dismissed";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    // register the service worker for offline / installability
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (standalone || dismissed) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS does not fire beforeinstallprompt — show manual hint
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (isIos) {
      setIosHint(true);
      setShow(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-md px-3 md:bottom-4">
      <div className="flex items-center gap-3 rounded-2xl border bg-[rgb(var(--background))] p-3 shadow-lg">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-lg font-black text-white">
          S
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Install SandisTech News</p>
          {iosHint ? (
            <p className="text-xs text-muted">
              Tap <Share className="inline h-3 w-3" /> then “Add to Home Screen”.
            </p>
          ) : (
            <p className="text-xs text-muted">Add the app to your home screen.</p>
          )}
        </div>
        {!iosHint && (
          <button onClick={install} className="btn-primary !px-3 !py-2 text-sm">
            <Download className="h-4 w-4" />
            Install
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="btn-ghost !px-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
