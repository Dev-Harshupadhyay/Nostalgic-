"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "@/components/player/PlayerProvider";

type Toast = { id: number; text: string; sub?: string; leaving?: boolean };

/**
 * Non-blocking toast stack.
 *  - a welcome message on first paint of the session
 *  - ad-hoc messages pushed through usePlayer().notify()
 * Never uses window.alert, never traps focus, announced via aria-live.
 */
export default function WelcomeToast() {
  const { toastMessage } = usePlayer();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = (text: string, sub?: string, ttl = 4200) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, text, sub }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 320);
    }, ttl);
  };

  useEffect(() => {
    const t = window.setTimeout(
      () => push("Welcome back 🎧", "Enjoy the music — built with ❤️ by Harsh.", 5200),
      700
    );
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    push(toastMessage.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastMessage?.id]);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 top-[68px] z-[95] flex flex-col items-center gap-2 px-4 sm:top-auto sm:bottom-[calc(var(--miniplayer-h)+22px)] sm:right-5 sm:left-auto sm:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`glass pointer-events-auto max-w-[min(92vw,360px)] rounded-2xl px-4 py-3 shadow-[0_18px_46px_-20px_rgba(0,0,0,0.95)] ${
            t.leaving ? "toast-out" : "toast-in"
          }`}
        >
          <p className="text-sm font-semibold text-white">{t.text}</p>
          {t.sub ? <p className="mt-0.5 text-xs text-white/55">{t.sub}</p> : null}
        </div>
      ))}
    </div>
  );
}
