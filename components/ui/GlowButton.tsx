"use client";

import { useCallback, useRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "glow" | "ghost";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "px-3.5 py-2 text-[0.8rem]",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-[0.95rem]",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  aura?: boolean;
  children: ReactNode;
};

/**
 * Pointer-reactive button: JS tracks the cursor and feeds CSS variables that
 * drive the radial glow, plus an imperative ripple on press. Respects
 * prefers-reduced-motion (no ripple, no tracking) for accessibility.
 */
export default function GlowButton({
  variant = "glow",
  size = "md",
  aura = false,
  className = "",
  children,
  onPointerMove,
  onPointerDown,
  ...rest
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      onPointerMove?.(e);
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
    },
    [onPointerMove]
  );

  const handleDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(e);
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    },
    [onPointerDown]
  );

  return (
    <button
      ref={ref}
      type="button"
      onPointerMove={handleMove}
      onPointerDown={handleDown}
      className={`btn ${variant === "glow" ? "btn-glow" : "btn-ghost"} ${SIZES[size]} ${
        aura ? "btn-aura" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
