"use client";

import Link from "next/link";
import Image from "next/image";
import GlowButton from "@/components/ui/GlowButton";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { Song } from "@/lib/types";
import { Play, Sparkle, ChevronRight } from "@/components/ui/Icons";

export default function Hero({ starterQueue }: { starterQueue: Song[] }) {
  const { playQueue, resumeTarget, resumeLast } = usePlayer();

  return (
    <section className="home-hero-wrap">
      <div className="home-hero mx-auto max-w-[1400px]">
        <div aria-hidden className="home-hero-ambient" />
        <div className="home-hero-copy fade-up">
          <span className="home-hero-badge">
            <Sparkle size={13} /> HARSH&apos;S NOSTALGIC MUSIC UNIVERSE
          </span>

          <h1>
            Your memories,<br />
            <span>one song at a time.</span>
          </h1>
          <p>Old favourites, timeless classics and Chhath devotion—each music world has its own place.</p>

          <div className="home-hero-actions">
            <GlowButton
              size="lg"
              aura
              onClick={() => playQueue(starterQueue, 0)}
              disabled={!starterQueue.length}
              aria-label="Start with old songs"
            >
              <Play size={17} /> Start with Old Songs
            </GlowButton>
            <Link href="#music-worlds-title" className="btn btn-ghost px-5 py-3 text-sm">
              Explore music <ChevronRight size={16} />
            </Link>
            {resumeTarget ? (
              <button type="button" onClick={resumeLast} className="home-resume-link">
                Resume last song <span aria-hidden>↗</span>
              </button>
            ) : null}
          </div>
          <div className="home-hero-proof"><span className="home-live-dot" /> One shared YouTube player · clear category homes</div>
        </div>

        <div className="home-hero-art" aria-hidden="true">
          <Image
            src="/images/nostalgic-hero-clean.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 60vw, 40vw"
            className="home-hero-photo"
          />
          <div className="home-hero-art-shade" />
          <div className="home-hero-art-tag"><span>NOW SPINNING</span><b>GOOD MEMORIES</b></div>
          {starterQueue[0] ? (
            <button type="button" className="home-feature-card" onClick={() => playQueue(starterQueue, 0)} aria-label={`Play ${starterQueue[0].title}`}>
              <span className="home-feature-thumb">
                <Image src={starterQueue[0].thumbnail || "/images/old-songs.jpg"} alt="" fill sizes="64px" />
                <span className="home-feature-play"><Play size={14} /></span>
              </span>
              <span className="home-feature-copy">
                <span>FEATURED OLD SONG</span>
                <strong>{starterQueue[0].title}</strong>
                <small>{starterQueue[0].artist || "YouTube classic"}</small>
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
