import type { SVGProps } from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  focusable: false,
};

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} {...base} {...rest}>
      {children}
    </svg>
  );
}

export const Play = (p: P) => (
  <Svg {...p}>
    <path d="M7 4.5v15l12-7.5-12-7.5z" fill="currentColor" stroke="none" />
  </Svg>
);

export const Pause = (p: P) => (
  <Svg {...p}>
    <rect x="6.5" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="13.9" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" stroke="none" />
  </Svg>
);

export const Prev = (p: P) => (
  <Svg {...p}>
    <path d="M18 5.5v13L8.5 12 18 5.5z" fill="currentColor" stroke="none" />
    <rect x="5" y="5.5" width="2.4" height="13" rx="1.1" fill="currentColor" stroke="none" />
  </Svg>
);

export const Next = (p: P) => (
  <Svg {...p}>
    <path d="M6 5.5v13L15.5 12 6 5.5z" fill="currentColor" stroke="none" />
    <rect x="16.6" y="5.5" width="2.4" height="13" rx="1.1" fill="currentColor" stroke="none" />
  </Svg>
);

export const Shuffle = (p: P) => (
  <Svg {...p}>
    <path d="M17 4l3 3-3 3M17 14l3 3-3 3" />
    <path d="M4 7h3.2c1.6 0 2.6.9 3.6 2.4l2.4 5.2c.9 1.5 2 2.4 3.6 2.4H20" />
    <path d="M4 17h3.2c1.5 0 2.5-.8 3.4-2.1M15 9.1c.9-1.3 1.9-2.1 3.4-2.1H20" />
  </Svg>
);

export const Repeat = (p: P) => (
  <Svg {...p}>
    <path d="M17 2l3 3-3 3" />
    <path d="M20 5H8a4 4 0 0 0-4 4v1" />
    <path d="M7 22l-3-3 3-3" />
    <path d="M4 19h12a4 4 0 0 0 4-4v-1" />
  </Svg>
);

export const RepeatOne = (p: P) => (
  <Svg {...p}>
    <path d="M17 2l3 3-3 3" />
    <path d="M20 5H8a4 4 0 0 0-4 4v1" />
    <path d="M7 22l-3-3 3-3" />
    <path d="M4 19h12a4 4 0 0 0 4-4v-1" />
    <path d="M11.4 10.6l1.3-.8v4.4" strokeWidth={2} />
  </Svg>
);

export const Volume = (p: P) => (
  <Svg {...p}>
    <path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4z" fill="currentColor" stroke="none" />
    <path d="M15.6 9a4 4 0 0 1 0 6M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />
  </Svg>
);

export const VolumeMute = (p: P) => (
  <Svg {...p}>
    <path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4z" fill="currentColor" stroke="none" />
    <path d="M16 9.5l5 5M21 9.5l-5 5" />
  </Svg>
);

export const Queue = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h11M4 12h11M4 17h7" />
    <path d="M17.5 13.2V19a1.9 1.9 0 1 1-1.6-1.9" />
    <path d="M17.5 13.2l3.3-1v5.3" />
  </Svg>
);

export const Heart = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Svg {...p}>
    <path
      d="M12 20.3l-1.3-1.2C6 14.9 3.2 12.4 3.2 9.2A4.7 4.7 0 0 1 8 4.5c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2a4.7 4.7 0 0 1 4.8 4.7c0 3.2-2.8 5.7-7.5 9.9L12 20.3z"
      fill={filled ? "currentColor" : "none"}
    />
  </Svg>
);

export const Share = (p: P) => (
  <Svg {...p}>
    <circle cx="17.5" cy="5.6" r="2.6" />
    <circle cx="6.5" cy="12" r="2.6" />
    <circle cx="17.5" cy="18.4" r="2.6" />
    <path d="M8.9 10.8l6.3-3.7M8.9 13.2l6.3 3.7" />
  </Svg>
);

export const Search = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.4" />
    <path d="M16 16l4.5 4.5" />
  </Svg>
);

export const Close = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const ChevronDown = (p: P) => (
  <Svg {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </Svg>
);

export const ChevronRight = (p: P) => (
  <Svg {...p}>
    <path d="M9.5 6l6 6-6 6" />
  </Svg>
);

export const Plus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const Trash = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M9.5 7V5.3A1.3 1.3 0 0 1 10.8 4h2.4a1.3 1.3 0 0 1 1.3 1.3V7" />
    <path d="M6.5 7l.9 12.1A1.9 1.9 0 0 0 9.3 21h5.4a1.9 1.9 0 0 0 1.9-1.9L17.5 7" />
  </Svg>
);

export const Grip = (p: P) => (
  <Svg {...p}>
    <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" strokeWidth={2.4} />
  </Svg>
);

export const Music = (p: P) => (
  <Svg {...p}>
    <path d="M9 18V6.5l10-2V16" />
    <circle cx="6.6" cy="18" r="2.6" />
    <circle cx="16.6" cy="16" r="2.6" />
  </Svg>
);

export const Home = (p: P) => (
  <Svg {...p}>
    <path d="M4 10.5L12 4l8 6.5" />
    <path d="M6 9.8V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.8" />
  </Svg>
);

export const Sparkle = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.5l1.9 4.9 4.9 1.9-4.9 1.9L12 17.1l-1.9-4.9L5.2 10.3l4.9-1.9L12 3.5z" />
  </Svg>
);

export const ExternalLink = (p: P) => (
  <Svg {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-8.5 8.5" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Svg>
);

export const Spinner = ({ size = 20, className = "", ...p }: P) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={`animate-spin ${className}`}
    aria-hidden
    {...p}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" opacity="0.22" fill="none" />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
