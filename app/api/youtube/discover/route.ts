import { NextResponse } from "next/server";
import { searchYouTube } from "@/lib/youtube.server";
import { DISCOVERY_QUERIES, getGroup } from "@/lib/catalog";
import type { GroupKey } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 1800;

const VALID: GroupKey[] = ["evergreen", "oldSongs", "singleSongs", "trending", "chhathPuja", "bhojpuri"];

/**
 * GET /api/youtube/discover?group=trending&category=Trending%20Now
 *
 * Refreshes one category with live YouTube results. Results are presented as
 * "search results", never as a verified popularity ranking.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group") as GroupKey | null;
  const category = searchParams.get("category") ?? "";

  if (!group || !VALID.includes(group)) {
    return NextResponse.json({ results: [], error: "Unknown group." }, { status: 400 });
  }

  const query = DISCOVERY_QUERIES[group]?.[category];
  if (!query) {
    return NextResponse.json({ results: [], error: "Unknown category." }, { status: 400 });
  }

  try {
    const { results, source } = await searchYouTube(query, { max: 24, category });
    if (results.length) {
      return NextResponse.json({ results, source, group, category });
    }
    const fallback = getGroup(group).filter((s) => s.category === category);
    return NextResponse.json({ results: fallback, source: "catalog", group, category });
  } catch (err) {
    console.error("[api/youtube/discover]", err);
    const fallback = getGroup(group).filter((s) => s.category === category);
    return NextResponse.json(
      {
        results: fallback,
        source: "catalog",
        group,
        category,
        error: "Live discovery unavailable, showing saved results.",
      },
      { status: 200 }
    );
  }
}
