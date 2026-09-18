import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";

export const runtime = "nodejs";
/** Never cached or prerendered — a cached 200 would defeat the whole point. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BOOTED_AT = Date.now();

/**
 * GET /api/health — liveness probe.
 *
 * Built for an external cron/uptime pinger: Render's free tier spins the
 * service down after ~15 minutes of inactivity, and the next visitor then eats
 * a ~50s cold start. A scheduled hit here keeps the instance warm.
 *
 * Always answers 200 when the process can serve traffic. It deliberately does
 * no outbound work (no YouTube calls, no network) so it stays fast, free and
 * cannot fail because a third party is down. The payload is tiny and carries
 * no secrets or request data.
 *
 * HEAD is supported too, since most uptime services prefer it.
 */
export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - BOOTED_AT) / 1000);

  return NextResponse.json(
    {
      status: "ok",
      service: "nostalgic-music-player",
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      // Proves the app booted far enough to read its own data, not just that
      // the HTTP layer is answering.
      catalogSongs:
        catalog.oldSongs.length +
        catalog.singleSongs.length +
        catalog.trending.length +
        catalog.chhathPuja.length +
        catalog.bhojpuri.length,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Content-Type": "application/json; charset=utf-8",
      },
    }
  );
}

/** Uptime monitors often use HEAD; answer it without a body. */
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
