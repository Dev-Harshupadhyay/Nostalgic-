"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clamp, formatTime } from "@/lib/format";

type Props = {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  /** "lg" = full player (thick, touch-friendly), "sm" = mini player. */
  size?: "sm" | "lg";
  showTimes?: boolean;
  disabled?: boolean;
};

/**
 * Interactive timeline: click to seek, drag to scrub, keyboard accessible.
 * While dragging, the displayed time follows the thumb — the real seek is only
 * committed on release, so scrubbing stays smooth.
 */
export default function ProgressBar({
  currentTime,
  duration,
  onSeek,
  size = "lg",
  showTimes = true,
  disabled = false,
}: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragRatio, setDragRatio] = useState<number | null>(null);
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);

  const hasDuration = duration > 0;
  const ratio = dragRatio ?? (hasDuration ? clamp(currentTime / duration, 0, 1) : 0);
  const displayTime = dragRatio != null ? dragRatio * duration : currentTime;

  const ratioFrom = useCallback((clientX: number) => {
    const rail = railRef.current;
    if (!rail) return 0;
    const rect = rail.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return clamp((clientX - rect.left) / rect.width, 0, 1);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || !hasDuration) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setDragRatio(ratioFrom(e.clientX));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!hasDuration) return;
    if (dragging) setDragRatio(ratioFrom(e.clientX));
    else if (e.pointerType === "mouse") setHoverRatio(ratioFrom(e.clientX));
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    const r = ratioFrom(e.clientX);
    setDragging(false);
    setDragRatio(null);
    if (hasDuration) onSeek(r * duration);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || !hasDuration) return;
    const step = e.shiftKey ? 30 : 5;
    let handled = true;
    switch (e.key) {
      case "ArrowRight":
        onSeek(clamp(currentTime + step, 0, duration));
        break;
      case "ArrowLeft":
        onSeek(clamp(currentTime - step, 0, duration));
        break;
      case "Home":
        onSeek(0);
        break;
      case "End":
        onSeek(duration);
        break;
      default:
        handled = false;
    }
    if (handled) e.preventDefault();
  };

  /* Release pointer capture if the component unmounts mid-drag. */
  useEffect(() => {
    if (!dragging) return;
    const cancel = () => {
      setDragging(false);
      setDragRatio(null);
    };
    window.addEventListener("pointercancel", cancel);
    return () => window.removeEventListener("pointercancel", cancel);
  }, [dragging]);

  const isLarge = size === "lg";

  return (
    <div className="w-full">
      <div
        className={`timeline ${isLarge ? "timeline-lg" : "timeline-sm"}`}
        data-dragging={dragging || undefined}
        data-disabled={disabled || !hasDuration || undefined}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Seek through the song"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration) || 0}
        aria-valuenow={Math.round(displayTime) || 0}
        aria-valuetext={`${formatTime(displayTime)} of ${
          hasDuration ? formatTime(duration) : "unknown duration"
        }`}
        aria-disabled={disabled || !hasDuration}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={() => setHoverRatio(null)}
        onKeyDown={onKeyDown}
      >
        <div ref={railRef} className="timeline-rail">
          {hoverRatio != null && !dragging ? (
            <span className="timeline-hover" style={{ width: `${hoverRatio * 100}%` }} aria-hidden />
          ) : null}
          <span
            className="timeline-fill"
            style={{
              width: `${ratio * 100}%`,
              transition: dragging ? "none" : "width 260ms linear",
            }}
          />
        </div>
        <span
          className="timeline-thumb"
          style={{ left: `${ratio * 100}%`, transition: dragging ? "none" : "left 260ms linear" }}
          aria-hidden
        />
        {dragging ? (
          <span className="timeline-bubble" style={{ left: `${ratio * 100}%` }} aria-hidden>
            {formatTime(displayTime)}
          </span>
        ) : null}
      </div>

      {showTimes ? (
        <div
          className={`mt-1.5 flex items-center justify-between font-medium tabular-nums text-white/55 ${
            isLarge ? "text-xs" : "text-[0.66rem]"
          }`}
        >
          <span aria-hidden>{formatTime(displayTime)}</span>
          <span aria-hidden>{hasDuration ? formatTime(duration) : "--:--"}</span>
        </div>
      ) : null}
    </div>
  );
}
