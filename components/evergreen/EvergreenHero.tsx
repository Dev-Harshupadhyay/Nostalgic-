"use client";

import { useMemo } from "react";
import GlowButton from "@/components/ui/GlowButton";
import { usePlayer } from "@/components/player/PlayerProvider";
import { getGroup } from "@/lib/catalog";
import { Play } from "@/components/ui/Icons";

/**
 * Glowing hero for the Evergreen collection.
 * Pure CSS aurora + shimmer — no images, no extra payload.
 */
export default function EvergreenHero({ count }: { count: number }) {
  const { playQueue } = usePlayer();
  const songs = useMemo(() => getGroup("evergreen"), []);

  const shuffle = () => {
    const list = [...songs];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    playQueue(list, 0);
  };

  return (
    <header className="eg-hero fade-up relative overflow-hidden rounded-[28px] px-5 py-10 sm:px-9 sm:py-14">
      <div aria-hidden className="eg-aurora" />
      <div aria-hidden className="eg-rings" />

      <p className="eyebrow relative">Timeless collection</p>

      <h1 className="eg-title relative mt-2 text-[2.1rem] font-extrabold tracking-tight sm:text-[3.4rem]">
        <span aria-hidden className="mr-2">✨</span>Evergreen
      </h1>

      <p className="relative mt-3 max-w-2xl text-sm leading-relaxed text-white/62 sm:text-base">
        <b className="text-white/85">2000s ke solid hits</b> aur sadabahar melodies — woh gaane jo
        aaj bhi utne hi fresh lagte hain. Ek baar play karo, poora din set hai.
      </p>

      <div className="relative mt-6 flex flex-wrap items-center gap-3">
        <GlowButton size="lg" aura onClick={() => playQueue(songs, 0)} aria-label="Play all evergreen songs">
          <Play size={16} />
          Play all
        </GlowButton>
        <button type="button" onClick={shuffle} className="btn btn-ghost px-5 py-2.5 text-sm">
          <span aria-hidden>🔀</span> Shuffle
        </button>
        <span className="eg-chip">{count} songs</span>
      </div>
    </header>
  );
}
