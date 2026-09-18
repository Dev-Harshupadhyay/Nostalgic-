"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  className?: string;
  /** Scroll speed in pixels per second. */
  speed?: number;
};

/**
 * Scrolls text horizontally only when it genuinely overflows its container.
 *
 * Short titles must not wobble, so the animation is enabled from a real width
 * measurement rather than a character-count guess (CJK/Devanagari glyphs are
 * far wider than Latin ones at the same length). The duplicate copy is what
 * makes the loop seamless; it is hidden from assistive tech and removed
 * entirely under prefers-reduced-motion.
 */
export default function Marquee({ text, className = "", speed = 42 }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [scroll, setScroll] = useState(false);
  const [duration, setDuration] = useState(16);

  useEffect(() => {
    const viewport = viewportRef.current;
    const measure = measureRef.current;
    if (!viewport || !measure) return;

    const check = () => {
      const contentWidth = measure.scrollWidth;
      const boxWidth = viewport.clientWidth;
      // 4px of slack: never animate for a sub-pixel rounding difference.
      const overflows = contentWidth > boxWidth + 4;
      setScroll(overflows);
      if (overflows) {
        const gap = 56; // must match .pp-marquee-gap
        setDuration(Math.max(8, (contentWidth + gap) / speed));
      }
    };

    check();

    // Re-measure on resize (rotation, split-screen, font swap).
    const ro = new ResizeObserver(check);
    ro.observe(viewport);
    ro.observe(measure);
    return () => ro.disconnect();
  }, [text, speed]);

  return (
    <div
      ref={viewportRef}
      className={`pp-marquee ${className}`}
      data-scroll={scroll ? "true" : "false"}
      style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      title={text}
    >
      <div className="pp-marquee-track">
        <span ref={measureRef}>{text}</span>
        {scroll ? (
          <>
            <span className="pp-marquee-gap" aria-hidden />
            <span className="pp-marquee-dup" aria-hidden>
              {text}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
