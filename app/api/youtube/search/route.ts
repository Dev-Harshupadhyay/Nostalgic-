import { NextResponse } from "next/server";
import { searchYouTube } from "@/lib/youtube.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/youtube/search?q=...&max=20&pageToken=...&category=Search
 *
 * The YouTube API key (if any) lives only in server env — it is never sent to
 * the browser. The client only ever receives normalized Song[] objects, so the
 * secret cannot leak through the response either.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").slice(0, 120).trim();
  const max = Math.min(Math.max(Number(searchParams.get("max") ?? 20) || 20, 1), 40);
  const category = (searchParams.get("category") ?? "Search").slice(0, 60);
  const pageToken = (searchParams.get("pageToken") ?? "").slice(0, 200) || undefined;

  if (!q) {
    return NextResponse.json(
      { results: [], query: "", source: "catalog", error: "Missing search query." },
      { status: 400 }
    );
  }

  try {
    const { results, source, cached, nextPageToken } = await searchYouTube(q, {
      max,
      category,
      pageToken,
    });
    return NextResponse.json(
      { results, query: q, source, cached, nextPageToken },
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
