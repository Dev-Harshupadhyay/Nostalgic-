"use client";

import { usePlayer } from "@/components/player/PlayerProvider";
import SongShelf from "@/components/music/SongShelf";
import GlowButton from "@/components/ui/GlowButton";
import { shortTitle } from "@/lib/format";
import { Play } from "@/components/ui/Icons";

export function RecentlyPlayed() {
  const { recentlyPlayed } = usePlayer();
  if (recentlyPlayed.length === 0) return null;
  return (
    <SongShelf
      title="Recently Played"
      subtitle="From this device"
      songs={recentlyPlayed}
      compact
    />
  );
}

export function ContinueListening() {
  const { resumeTarget, resumeLast, current } = usePlayer();
  if (!resumeTarget || current?.youtubeId === resumeTarget.song.youtubeId) return null;

  const mins = Math.floor(resumeTarget.position / 60);
  const secs = Math.floor(resumeTarget.position % 60);

  return (
    <section aria-labelledby="continue-heading" className="px-1">
      <h2 id="continue-heading" className="mb-3 text-[1.05rem] font-bold sm:text-lg">
        Continue Listening
      </h2>
      <div className="glass flex items-center gap-4 rounded-2xl p-3 sm:p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resumeTarget.song.thumbnail}
          alt=""
          className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Pick up where you left off</p>
          <p className="line-1 mt-1 text-sm font-semibold text-white/90">
            {shortTitle(resumeTarget.song.title, 54)}
          </p>
          <p className="line-1 text-xs text-white/45">
            {resumeTarget.song.artist} · paused at {mins}:{`${secs}`.padStart(2, "0")}
          </p>
        </div>
        <GlowButton size="md" onClick={resumeLast} aria-label="Resume playback">
          <Play size={15} />
          <span className="hidden sm:inline">Resume</span>
        </GlowButton>
      </div>
    </section>
  );
}
