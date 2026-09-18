"use client";

import type { PlayerStatus } from "@/lib/types";

const LABEL: Record<PlayerStatus, string> = {
  idle: "Nothing playing",
  loading: "Loading…",
  buffering: "Buffering…",
  playing: "Now playing",
  paused: "Paused",
  ended: "Finished",
  error: "Playback error",
};

/**
 * Animated status pill. The dot only pulses while audio is actually playing,
 * so the indicator reflects real player state instead of decorating everything.
 */
export default function NowPlaying({
  status,
  className = "",
}: {
  status: PlayerStatus;
  className?: string;
}) {
  const live = status === "playing";
  return (
    <span className={`pp-now ${live ? "" : "is-idle"} ${className}`}>
      <span className="pp-now-dot" aria-hidden />
      {LABEL[status] ?? ""}
    </span>
  );
}
