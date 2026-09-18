import { NextResponse } from "next/server";
import { searchYouTube } from "@/lib/youtube.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/youtube/search?q=...&max=24&category=Search
 *
 * The YouTube API key (if any) lives only in server env — it is never sent to
 * the browser. The client only ever receives normalized Song[] objects.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").slice(0, 120).trim();
  const max = Math.min(Math.max(Number(searchParams.get("max") ?? 24) || 24, 1), 40);
  const category = (searchParams.get("category") ?? "Search").slice(0, 60);

  if (!q) {
    return NextResponse.json(
      { results: [], query: "", source: "catalog", error: "Missing search query." },
      { status: 400 }
    );
  }

  try {
    const { results, source, cached } = await searchYouTube(q, { max, category });
    return NextResponse.json(
      { results, query: q, source, cached },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err) {
    console.error("[api/youtube/search]", err);
    return NextResponse.json(
      {
        results: [],
        query: q,
        source: "catalog",
        error: "Music service is temporarily unavailable. Please try again.",
      },
      { status: 503 }
    );
  }
}
