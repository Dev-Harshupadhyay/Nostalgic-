"use client";

import Link from "next/link";
import GlowButton from "@/components/ui/GlowButton";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { Song } from "@/lib/types";
import { Play, Sparkle } from "@/components/ui/Icons";

export default function Hero({ starterQueue }: { starterQueue: Song[] }) {
  const { playQueue, resumeTarget, resumeLast } = usePlayer();

  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(232,163,61,0.22),transparent_66%)] blur-3xl"
      />

      <div className="mx-auto max-w-[1400px]">
        <div className="fade-up max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/60 backdrop-blur">
            <Sparkle size={13} className="text-[color:var(--color-amber)]" />
            Harsh&apos;s Nostalgic Music Universe
          </span>

          <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Your memories,
            <br />
            <span className="warm-text">one song at a time.</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/58 sm:text-base">
            Discover old classics, new sounds, Chhath melodies and Bhojpuri favourites.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <GlowButton
              size="lg"
              aura
              onClick={() => playQueue(starterQueue, 0)}
              aria-label="Start listening to curated songs"
            >
              <Play size={17} />
              Start Listening
            </GlowButton>

            <Link href="/old-songs" className="btn btn-ghost px-6 py-3 text-[0.95rem]">
              Explore Music
            </Link>

            {resumeTarget ? (
              <button
                type="button"
                onClick={resumeLast}
                className="btn btn-ghost px-5 py-3 text-[0.85rem]"
              >
                ▸ Resume last song
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
