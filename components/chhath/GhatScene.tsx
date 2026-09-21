"use client";

/**
 * Animated Chhath ghat scene — pure inline SVG + CSS, no images, no JS loop.
 *
 * Two variants share one drawing:
 *   "sunset"  → Sandhya Arghya, the sun sinking into the river
 *   "sunrise" → Usha Arghya, the sun climbing out of it
 *
 * The sun really travels (its `y` is animated), the water ripples drift, the
 * diya flames flicker and the light column on the water breathes. Everything
 * stops under prefers-reduced-motion.
 */
export default function GhatScene({
  variant = "sunset",
  className = "",
}: {
  variant?: "sunset" | "sunrise";
  className?: string;
}) {
  const sunrise = variant === "sunrise";
  const id = sunrise ? "rise" : "set";

  return (
    <div className={`ghat ${sunrise ? "is-rise" : "is-set"} ${className}`} aria-hidden>
      <svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" role="presentation">
        <defs>
          <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
            {sunrise ? (
              <>
                <stop offset="0%" stopColor="#1a1442" />
                <stop offset="42%" stopColor="#6b3b6a" />
                <stop offset="72%" stopColor="#d97a46" />
                <stop offset="100%" stopColor="#f6c177" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#2b1a3d" />
                <stop offset="38%" stopColor="#8f3b52" />
                <stop offset="70%" stopColor="#d9682f" />
                <stop offset="100%" stopColor="#f2a44c" />
              </>
            )}
          </linearGradient>

          <radialGradient id={`sunglow-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff3cf" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#ffca6a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ff9b3d" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`water-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a4a62" />
            <stop offset="55%" stopColor="#14293c" />
            <stop offset="100%" stopColor="#0b1724" />
          </linearGradient>

          <linearGradient id={`col-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ------------------------------- Sky ------------------------------- */}
        <rect width="1000" height="360" fill={`url(#sky-${id})`} />

        {/* Slow drifting cloud bands */}
        <g className="ghat-clouds" opacity="0.22">
          <ellipse cx="180" cy="92" rx="150" ry="12" fill="#ffd8a8" />
          <ellipse cx="640" cy="64" rx="190" ry="10" fill="#ffd8a8" />
          <ellipse cx="880" cy="128" rx="130" ry="9" fill="#ffd8a8" />
        </g>

        {/* ------------------------------- Sun ------------------------------- */}
        <g className="ghat-sun">
          <circle cx="500" cy="0" r="210" fill={`url(#sunglow-${id})`} className="ghat-sun-glow" />
          <circle cx="500" cy="0" r="62" fill="#ffd77a" className="ghat-sun-core" />
          <g className="ghat-rays">
            {Array.from({ length: 16 }).map((_, i) => (
              <rect
                key={i}
                x="498"
                y="-150"
                width="4"
                height="56"
                rx="2"
                fill="#ffe4a8"
                opacity="0.5"
                transform={`rotate(${i * 22.5} 500 0)`}
              />
            ))}
          </g>
        </g>

        {/* --------------------------- Far treeline --------------------------- */}
        <g fill="#2a1730" opacity="0.92">
          <rect x="0" y="330" width="1000" height="34" />
          {[40, 120, 205, 300, 690, 780, 870, 950].map((x, i) => (
            <ellipse key={x} cx={x} cy={328} rx={34 + (i % 3) * 8} ry={20 + (i % 2) * 7} />
          ))}
          {/* little village huts */}
          <path d="M395 330 l22-18 22 18 z" />
          <rect x="400" y="330" width="34" height="0" />
          <path d="M455 330 l18-15 18 15 z" />
        </g>

        {/* ------------------------------ Water ------------------------------ */}
        <rect y="356" width="1000" height="204" fill={`url(#water-${id})`} />

        {/* Reflected light column on the water */}
        <path
          d="M470 360 L530 360 L580 560 L420 560 Z"
          fill={`url(#col-${id})`}
          className="ghat-col"
        />

        {/* Drifting ripple lines */}
        <g className="ghat-ripples" stroke="#9fd4e8" strokeWidth="2" fill="none" opacity="0.3">
          {Array.from({ length: 11 }).map((_, i) => {
            const y = 374 + i * 17;
            const amp = 3 + (i % 3);
            return (
              <path
                key={i}
                d={`M-120 ${y} q 40 -${amp} 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0`}
                className={`ghat-rip r${i % 3}`}
                opacity={0.9 - i * 0.06}
              />
            );
          })}
        </g>

        {/* ------------------------------ Ghat steps ------------------------ */}
        <g fill="#3a2436">
          <path d="M700 380 h300 v20 h-300 z" />
          <path d="M730 400 h270 v22 h-270 z" />
          <path d="M760 422 h240 v24 h-240 z" />
          <path d="M790 446 h210 v26 h-210 z" />
          <path d="M820 472 h180 v88 h-180 z" />
        </g>
        <g fill="#4b2f42" opacity="0.7">
          <path d="M700 380 h300 v4 h-300 z" />
          <path d="M730 400 h270 v4 h-270 z" />
          <path d="M760 422 h240 v4 h-240 z" />
          <path d="M790 446 h210 v4 h-210 z" />
        </g>

        {/* Sugarcane arch on the ghat */}
        <g stroke="#3f6b3a" strokeWidth="5" fill="none" strokeLinecap="round">
          <path d="M812 380 q -14 -70 6 -108" />
          <path d="M836 380 q -8 -74 16 -112" />
          <path d="M960 380 q 14 -70 -6 -108" />
          <path d="M936 380 q 8 -74 -16 -112" />
        </g>
        <path
          d="M826 272 q 60 44 104 0"
          stroke="#e8a33d"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="2 9"
          className="ghat-garland"
        />

        {/* ------------------------- Vratis in the water -------------------- */}
        <g className="ghat-people" fill="#1b0f1e">
          {[130, 210, 292, 372].map((x, i) => (
            <g key={x} className={`ghat-person p${i}`} transform={`translate(${x} 0)`}>
              {/* body in the water */}
              <path d="M0 412 q 15 -46 30 0 z" />
              <rect x="7" y="372" width="16" height="44" rx="8" />
              <circle cx="15" cy="364" r="9" />
              {/* raised arms holding the soop */}
              <path
                d="M8 378 L-2 350 M22 378 L32 350"
                stroke="#1b0f1e"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse cx="15" cy="344" rx="24" ry="7" fill="#c98a3c" />
              <ellipse cx="15" cy="340" rx="20" ry="5" fill="#e8b45c" />
            </g>
          ))}
        </g>

        {/* ------------------------------ Diyas ----------------------------- */}
        <g className="ghat-diyas">
          {[
            [90, 500],
            [190, 528],
            [300, 496],
            [400, 536],
            [510, 508],
            [150, 466],
            [610, 542],
            [350, 464],
            [255, 472],
            [455, 480],
          ].map(([x, y], i) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} className={`ghat-diya d${i % 4}`}>
              <ellipse cx="0" cy="0" rx="11" ry="4.5" fill="#8a4b22" />
              <ellipse cx="0" cy="-1.5" rx="8" ry="3" fill="#c96f31" />
              <ellipse cx="0" cy="-9" rx="4.5" ry="7" fill="#ffd36b" className="ghat-flame" />
              <ellipse cx="0" cy="-7" rx="2" ry="4" fill="#fff6d5" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
