"use client";

import { useCallback, useRef, useState } from "react";
import { clamp, formatTime } from "@/lib/format";

type Props = {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  showTimes?: boolean;
  compact?: boolean;
};

export default function ProgressBar({
  currentTime,
  duration,
  onSeek,
  showTimes = true,
  compact = false,
}: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragRatio, setDragRatio] = useState<number | null>(null);

  const ratio =
    dragRatio ?? (duration > 0 ? clamp(currentTime / duration, 0, 1) : 0);
  const displayTime = dragRatio != null ? dragRatio * duration : currentTime;

  const ratioFrom = useCallback((clientX: number) => {
    const rail = railRef.current;
    if (!rail) return 0;
    const rect = rail.getBoundingClientRect();
    return clamp((clientX - rect.left) / rect.width, 0, 1);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!duration) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setDragRatio(ratioFrom(e.clientX));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragRatio(ratioFrom(e.clientX));
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    const r = ratioFrom(e.clientX);
    setDragging(false);
    setDragRatio(null);
    if (duration) onSeek(r * duration);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!duration) return;
    const step = e.shiftKey ? 30 : 5;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onSeek(clamp(currentTime + step, 0, duration));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onSeek(clamp(currentTime - step, 0, duration));
    } else if (e.key === "Home") {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSeek(duration);
    }
  };

  return (
    <div className={`w-full ${compact ? "" : "space-y-1.5"}`}>
      <div
        className="seek"
        data-dragging={dragging}
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration) || 0}
        aria-valuenow={Math.round(displayTime) || 0}
        aria-valuetext={`${formatTime(displayTime)} of ${formatTime(duration)}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <div ref={railRef} className="seek-rail">
          <div
            className="seek-fill"
            style={{ width: `${ratio * 100}%`, transition: dragging ? "none" : "width 220ms linear" }}
          />
        </div>
        <span className="seek-knob" style={{ left: `${ratio * 100}%` }} aria-hidden />
      </div>

      {showTimes ? (
        <div className="flex items-center justify-between text-[0.68rem] font-medium tabular-nums text-white/45">
          <span>{formatTime(displayTime)}</span>
          <span>{duration ? formatTime(duration) : "--:--"}</span>
        </div>
      ) : null}
    </div>
  );
}
