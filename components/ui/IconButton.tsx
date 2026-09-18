"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tooltip?: string;
  active?: boolean;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "accent" | "rose";
  children: ReactNode;
};

const SIZES = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

/**
 * Icon-only control with a real accessible name, a desktop tooltip and a
 * touch-friendly hit area (min 44px on coarse pointers, via .tap-target).
 */
export default function IconButton({
  label,
  tooltip,
  active = false,
  size = "md",
  tone = "default",
  className = "",
  children,
  ...rest
}: Props) {
  const toneClass =
    tone === "accent"
      ? "text-[color:var(--color-amber)]"
      : tone === "rose"
      ? "text-[color:var(--color-rose)]"
      : "text-white/65 hover:text-white";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={rest["aria-pressed"] ?? (active || undefined)}
      data-tooltip={tooltip ?? label}
      className={`icon-btn tap-target ${SIZES[size]} ${
        active ? "is-active" : toneClass
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
