"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useUser } from "@/components/user/UserProvider";

type Toast = { id: number; text: string; sub?: string; leaving?: boolean };

/**
 * Non-blocking toast stack.
 *  - a welcome message on first paint of the session
 *  - ad-hoc messages pushed through usePlayer().notify()
 * Never uses window.alert, never traps focus, announced via aria-live.
 */
function greeting(hour: number): string {
  if (hour < 5) return "Raat ke is waqt bhi music";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default function WelcomeToast() {
  const { toastMessage } = usePlayer();
  const { name, hydrated, onboarded } = useUser();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = (text: string, sub?: string, ttl = 4200) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, text, sub }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 320);
    }, ttl);
  };

  /* Fires once the welcome dialog has resolved, so the greeting never races
     the name prompt. Always auto-dismisses. */
  const greetedRef = useRef(false);
  useEffect(() => {
    if (!hydrated || !onboarded || greetedRef.current) return;
    greetedRef.current = true;
    const hello = greeting(new Date().getHours());
    const t = window.setTimeout(() => {
      if (name) {
        push(`${hello}, ${name} 🎧`, "Aapka music ready hai — enjoy!", 5200);
      } else {
        push("Welcome 🎧", "Enjoy the music — built with ❤️ by Harsh.", 5200);
      }
    }, 650);
    return () => window.clearTimeout(t);
  }, [hydrated, onboarded, name]);

  useEffect(() => {
    if (!toastMessage) return;
    push(toastMessage.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastMessage?.id]);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--miniplayer-h)+18px)] z-[95] flex flex-col items-center gap-2 px-4 sm:right-5 sm:bottom-[calc(var(--miniplayer-h)+22px)] sm:left-auto sm:items-end"
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
