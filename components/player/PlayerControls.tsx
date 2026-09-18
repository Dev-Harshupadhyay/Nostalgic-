"use client";

import { usePlayer } from "./PlayerProvider";
import IconButton from "@/components/ui/IconButton";
import {
  Play,
  Pause,
  Prev,
  Next,
  Shuffle,
  Repeat,
  RepeatOne,
  Spinner,
} from "@/components/ui/Icons";

type Props = { size?: "sm" | "md" | "lg"; showExtras?: boolean };

const MAIN = {
  sm: { btn: "h-11 w-11", icon: 18 },
  md: { btn: "h-14 w-14", icon: 22 },
  lg: { btn: "h-[68px] w-[68px]", icon: 28 },
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
    canGoNext,
    canGoPrevious,
  } = usePlayer();

  const dim = MAIN[size];
  const loading = status === "loading" || status === "buffering";
  const idle = !current;

  const repeatLabel =
    repeat === "off" ? "Repeat: off" : repeat === "all" ? "Repeat: queue" : "Repeat: this song";

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {showExtras ? (
        <IconButton
          label="Shuffle"
          tooltip={shuffle ? "Shuffle: on" : "Shuffle: off"}
          active={shuffle}
          onClick={toggleShuffle}
          disabled={idle}
          size="md"
        >
          <Shuffle size={20} />
        </IconButton>
      ) : null}

      <IconButton
        label="Previous song"
        tooltip="Previous"
        onClick={previous}
        disabled={idle || !canGoPrevious}
        size="md"
      >
        <Prev size={22} />
      </IconButton>

      <button
        type="button"
        onClick={togglePlay}
        disabled={idle}
        aria-label={isPlaying ? "Pause song" : "Play song"}
        data-tooltip={isPlaying ? "Pause" : "Play"}
        className={`btn btn-glow play-btn ${dim.btn} !p-0 disabled:opacity-40`}
      >
        {loading ? (
          <Spinner size={dim.icon} />
        ) : isPlaying ? (
          <Pause size={dim.icon} />
        ) : (
          <Play size={dim.icon} className="translate-x-[1.5px]" />
        )}
      </button>

      <IconButton
        label="Next song"
        tooltip="Next"
        onClick={next}
        disabled={idle || !canGoNext}
        size="md"
      >
        <Next size={22} />
      </IconButton>

      {showExtras ? (
        <IconButton
          label={repeatLabel}
          tooltip={repeatLabel}
          active={repeat !== "off"}
          onClick={cycleRepeat}
          disabled={idle}
          size="md"
        >
          {repeat === "one" ? <RepeatOne size={20} /> : <Repeat size={20} />}
        </IconButton>
      ) : null}
    </div>
  );
}
