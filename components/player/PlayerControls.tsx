"use client";

import { usePlayer } from "./PlayerProvider";
import { Play, Pause, Prev, Next, Shuffle, Repeat, RepeatOne, Spinner } from "@/components/ui/Icons";

type Props = { size?: "sm" | "md" | "lg"; showExtras?: boolean };

const DIM = {
  sm: { main: "h-10 w-10", icon: 18, side: 18 },
  md: { main: "h-12 w-12", icon: 20, side: 20 },
  lg: { main: "h-16 w-16", icon: 26, side: 24 },
};

export default function PlayerControls({ size = "md", showExtras = false }: Props) {
  const {
    isPlaying,
    status,
    togglePlay,
    next,
    previous,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
    current,
  } = usePlayer();
  const d = DIM[size];
  const loading = status === "loading" || status === "buffering";
  const disabled = !current;

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {showExtras ? (
        <button
          type="button"
          onClick={toggleShuffle}
          aria-label="Shuffle"
          aria-pressed={shuffle}
          className={`grid h-10 w-10 place-items-center rounded-full transition ${
            shuffle
              ? "bg-[color:var(--color-amber)]/16 text-[color:var(--color-amber)]"
              : "text-white/55 hover:text-white"
          }`}
        >
          <Shuffle size={d.side} />
        </button>
      ) : null}

      <button
        type="button"
        onClick={previous}
        disabled={disabled}
        aria-label="Previous song"
        className="grid h-10 w-10 place-items-center rounded-full text-white/80 transition hover:text-white active:scale-90 disabled:opacity-35"
      >
        <Prev size={d.side} />
      </button>

      <button
        type="button"
        onClick={togglePlay}
        disabled={disabled}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={`btn btn-glow ${d.main} !p-0 disabled:opacity-40`}
      >
        {loading ? (
          <Spinner size={d.icon} />
        ) : isPlaying ? (
          <Pause size={d.icon} />
        ) : (
          <Play size={d.icon} className="translate-x-[1px]" />
        )}
      </button>

      <button
        type="button"
        onClick={next}
        disabled={disabled}
        aria-label="Next song"
        className="grid h-10 w-10 place-items-center rounded-full text-white/80 transition hover:text-white active:scale-90 disabled:opacity-35"
      >
        <Next size={d.side} />
      </button>

      {showExtras ? (
        <button
          type="button"
          onClick={cycleRepeat}
          aria-label={`Repeat: ${repeat}`}
          className={`grid h-10 w-10 place-items-center rounded-full transition ${
            repeat !== "off"
              ? "bg-[color:var(--color-amber)]/16 text-[color:var(--color-amber)]"
              : "text-white/55 hover:text-white"
          }`}
        >
          {repeat === "one" ? <RepeatOne size={d.side} /> : <Repeat size={d.side} />}
        </button>
      ) : null}
    </div>
  );
}
