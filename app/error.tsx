"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl" aria-hidden>
        🎚️
      </p>
      <h1 className="text-xl font-bold">Something went off-key</h1>
      <p className="text-sm text-white/55">
        Music service is temporarily unavailable. Please try again.
      </p>
      <button type="button" onClick={reset} className="btn btn-glow px-6 py-3 text-sm">
        Try again
      </button>
    </div>
  );
}
