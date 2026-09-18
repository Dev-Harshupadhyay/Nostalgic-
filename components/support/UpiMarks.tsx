/**
 * Inline UPI app wordmarks.
 *
 * Drawn as plain SVG text/shapes rather than fetched brand assets: no external
 * requests, no hotlinking someone's logo CDN, and they stay crisp at any size.
 * These are indicative "works with" marks, not official brand logos.
 */

type MarkProps = { className?: string };

export function UpiMark({ className = "" }: MarkProps) {
  return (
    <svg
      viewBox="0 0 56 24"
      role="img"
      aria-label="UPI"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2 4h5l-2.6 16H2z" fill="#F47B20" />
      <path d="M8 4h5l-2.6 16H8z" fill="#0E8A44" />
      <text
        x="16"
        y="17"
        fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
        fontSize="12"
        fontWeight="700"
        fill="currentColor"
      >
        UPI
      </text>
    </svg>
  );
}

export function GPayMark({ className = "" }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 24"
      role="img"
      aria-label="Google Pay"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="12" r="7" fill="none" stroke="#4285F4" strokeWidth="3" />
      <path d="M10 12h7a7 7 0 0 1-7 7" fill="none" stroke="#34A853" strokeWidth="3" />
      <path d="M10 5a7 7 0 0 1 6 3.4" fill="none" stroke="#FBBC04" strokeWidth="3" />
      <path d="M4.5 16.5A7 7 0 0 1 10 5" fill="none" stroke="#EA4335" strokeWidth="3" />
      <text
        x="22"
        y="17"
        fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
        fontSize="12"
        fontWeight="600"
        fill="currentColor"
      >
        Pay
      </text>
    </svg>
  );
}

export function PhonePeMark({ className = "" }: MarkProps) {
  return (
    <svg
      viewBox="0 0 86 24"
      role="img"
      aria-label="PhonePe"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="4" width="16" height="16" rx="5" fill="#5F259F" />
      <path
        d="M7.2 9.1h5.2M9.8 9.1v6.2a1.4 1.4 0 0 0 1.4 1.4h1"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <text
        x="23"
        y="17"
        fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
        fontSize="12"
        fontWeight="600"
        fill="currentColor"
      >
        PhonePe
      </text>
    </svg>
  );
}

export function PaytmMark({ className = "" }: MarkProps) {
  return (
    <svg
      viewBox="0 0 62 24"
      role="img"
      aria-label="Paytm"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="6" width="14" height="12" rx="3" fill="#00BAF2" />
      <rect x="5.5" y="9" width="2.2" height="6" rx="1.1" fill="#fff" />
      <rect x="9" y="9" width="2.2" height="6" rx="1.1" fill="#fff" />
      <text
        x="20"
        y="17"
        fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
        fontSize="12"
        fontWeight="600"
        fill="currentColor"
      >
        Paytm
      </text>
    </svg>
  );
}
