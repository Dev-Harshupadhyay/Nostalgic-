import { NextResponse } from "next/server";
import { getPublicPlaylist, PlaylistError } from "@/lib/youtube-playlist.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/youtube/playlist?url=https://www.youtube.com/playlist?list=...
 *
 * Only public playlist metadata and video details are returned. Private,
 * unavailable or Watch Later playlists receive a clear, non-leaky error.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = (searchParams.get("url") ?? "").slice(0, 2000).trim();
  const max = Math.min(Math.max(Number(searchParams.get("max") ?? 100) || 100, 1), 100);

  try {
    const playlist = await getPublicPlaylist(url, max);
    return NextResponse.json(playlist, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    if (error instanceof PlaylistError) {
      return NextResponse.json(
        { code: error.code, error: error.message, songs: [] },
        { status: error.status }
      );
    }
    console.error("[api/youtube/playlist]", error);
    return NextResponse.json(
      {
        code: "UNAVAILABLE",
        error: "Playlist abhi fetch nahi ho pa rahi. Link check karke dobara try karein.",
        songs: [],
      },
      { status: 503 }
    );
  }
}
