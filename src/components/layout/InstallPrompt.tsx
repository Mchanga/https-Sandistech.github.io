"use client";

import { useEffect, useState } from "react";
import { Download, X, Share, Plus, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa_install_dismissed";

function detectIos() {
  const ua = window.navigator.userAgent;
  const iOS = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ reports as Mac but has touch
  const iPadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOS || iPadOS;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [iosSheet, setIosSheet] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (standalone || dismissed) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS does not fire beforeinstallprompt — show manual flow
    if (detectIos()) {
      setIsIos(true);
      setShow(true);
    }

    const onInstalled = () => {
      setShow(false);
      setIosSheet(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setShow(false);
    setIosSheet(false);
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
    <>
      <div className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-md px-3 md:bottom-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-600 to-blue-900 p-4 text-white shadow-2xl shadow-brand-600/30">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="relative flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt="SandisTech News"
              className="h-12 w-12 shrink-0 rounded-2xl shadow-lg ring-1 ring-white/20"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                Install SandisTech News
              </p>
              <p className="text-xs text-white/80">
                {isIos
                  ? "Add to your iPhone or iPad home screen."
                  : "Get the full app on your phone or desktop."}
              </p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={isIos ? () => setIosSheet(true) : install}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-700 transition hover:bg-blue-50 active:scale-[0.98]"
          >
            {isIos ? (
              <>
                <Share className="h-4 w-4" />
                How to install
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Install app
              </>
            )}
          </button>
        </div>
      </div>

      {iosSheet && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center"
          onClick={() => setIosSheet(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-[rgb(var(--background))] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <img
                src="/icon-192.png"
                alt="SandisTech News"
                className="h-12 w-12 rounded-2xl shadow"
              />
              <div className="flex-1">
                <p className="font-extrabold">Add to Home Screen</p>
                <p className="text-xs text-muted">
                  Install SandisTech News on iOS in 3 steps.
                </p>
              </div>
              <button
                onClick={() => setIosSheet(false)}
                aria-label="Close"
                className="btn-ghost !px-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ol className="space-y-3">
              <Step n={1}>
                Tap the <Share className="mx-1 inline h-4 w-4 text-brand-600" />
                <b>Share</b> button in Safari&apos;s toolbar.
              </Step>
              <Step n={2}>
                Scroll down and tap{" "}
                <Plus className="mx-1 inline h-4 w-4 text-brand-600" />
                <b>Add to Home Screen</b>.
              </Step>
              <Step n={3}>
                Tap <b>Add</b> — the app icon appears on your home screen.
              </Step>
            </ol>
            <button
              onClick={dismiss}
              className="btn-primary mt-5 w-full"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
        {n}
      </span>
      <span className="pt-0.5 text-sm">{children}</span>
    </li>
  );
}
