import "server-only";
import type { Song } from "./types";
import { searchCatalog } from "./catalog";

/**
 * Server-only YouTube data layer.
 *
 * Strategy:
 *  1. If YOUTUBE_API_KEY is configured (server env only, never shipped to the
 *     browser) → official YouTube Data API v3.
 *  2. Otherwise → YouTube's own public results page, parsed server-side.
 *  3. If both fail → the bundled catalog, clearly reported as source "catalog".
 *
 * Nothing is fabricated: titles, channels, durations and thumbnails are always
 * whatever YouTube itself returned. We never synthesise view counts or rankings.
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

export type SearchSource = "youtube-api" | "youtube-public" | "catalog";

type CacheEntry = { at: number; results: Song[]; source: SearchSource };
const CACHE_TTL = 1000 * 60 * 30;
const cache = new Map<string, CacheEntry>();

function cacheGet(key: string): CacheEntry | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return hit;
}

function cacheSet(key: string, results: Song[], source: SearchSource) {
  if (cache.size > 120) cache.delete(cache.keys().next().value as string);
  cache.set(key, { at: Date.now(), results, source });
}

function thumbFor(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function isoToClock(iso?: string): string | undefined {
  if (!iso) return undefined;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return undefined;
  const h = Number(m[1] ?? 0);
  const min = Number(m[2] ?? 0);
  const s = Number(m[3] ?? 0);
  const mm = h > 0 ? `${min}`.padStart(2, "0") : `${min}`;
  return h > 0 ? `${h}:${mm}:${`${s}`.padStart(2, "0")}` : `${mm}:${`${s}`.padStart(2, "0")}`;
}

function normalize(
  raw: { youtubeId: string; title: string; artist: string; duration?: string; year?: string },
  category: string,
  language?: string
): Song {
  return {
    id: `yt-${raw.youtubeId}`,
    youtubeId: raw.youtubeId,
    title: raw.title,
    artist: raw.artist,
    thumbnail: thumbFor(raw.youtubeId),
    duration: raw.duration,
    category,
    language,
    year: raw.year,
    source: "youtube",
  };
}

/* ------------------------- Official Data API v3 ------------------------- */

async function searchViaApi(
  query: string,
  max: number,
  category: string,
  signal?: AbortSignal
): Promise<Song[] | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("videoCategoryId", "10");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("maxResults", String(Math.min(max, 25)));
  url.searchParams.set("q", query);
  url.searchParams.set("regionCode", "IN");
  url.searchParams.set("key", key);

  const res = await fetch(url, { signal, next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`youtube-api ${res.status}`);
  const data = (await res.json()) as {
    items?: { id?: { videoId?: string }; snippet?: Record<string, string> }[];
  };
  const items = (data.items ?? []).filter((i) => i.id?.videoId);
  const ids = items.map((i) => i.id!.videoId!).join(",");

  const durations = new Map<string, string>();
  if (ids) {
    try {
      const dUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      dUrl.searchParams.set("part", "contentDetails");
      dUrl.searchParams.set("id", ids);
      dUrl.searchParams.set("key", key);
      const dRes = await fetch(dUrl, { signal, next: { revalidate: 1800 } });
      if (dRes.ok) {
        const dData = (await dRes.json()) as {
          items?: { id: string; contentDetails?: { duration?: string } }[];
        };
        for (const it of dData.items ?? []) {
          const clock = isoToClock(it.contentDetails?.duration);
          if (clock) durations.set(it.id, clock);
        }
      }
    } catch {
      /* durations are optional */
    }
  }

  return items.map((i) =>
    normalize(
      {
        youtubeId: i.id!.videoId!,
        title: i.snippet?.title ?? "",
        artist: i.snippet?.channelTitle ?? "",
        duration: durations.get(i.id!.videoId!),
        year: i.snippet?.publishedAt?.slice(0, 4),
      },
      category
    )
  );
}

/* --------------------- Keyless public results parsing -------------------- */

function extractInitialData(html: string): unknown | null {
  const patterns = [
    /ytInitialData\s*=\s*(\{.+?\});<\/script>/s,
    /var\s+ytInitialData\s*=\s*(\{.+?\});/s,
    /window\["ytInitialData"\]\s*=\s*(\{.+?\});/s,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) {
      try {
        return JSON.parse(m[1]);
      } catch {
        /* try next pattern */
      }
    }
  }
  return null;
}

type RawResult = { youtubeId: string; title: string; artist: string; duration?: string };

function collectVideos(node: unknown, out: RawResult[], seen: Set<string>) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) collectVideos(child, out, seen);
    return;
  }
  const obj = node as Record<string, any>;
  const v = obj.videoRenderer;
  if (v?.videoId && !seen.has(v.videoId)) {
    const title: string =
      v.title?.runs?.map((r: { text: string }) => r.text).join("") ??
      v.title?.simpleText ??
      "";
    const artist: string =
      v.ownerText?.runs?.[0]?.text ?? v.longBylineText?.runs?.[0]?.text ?? "";
    const duration: string | undefined =
      v.lengthText?.simpleText ??
      v.lengthText?.accessibility?.accessibilityData?.label ??
      undefined;
    // Skip live streams / shelf placeholders that report no length.
    if (title && duration) {
      seen.add(v.videoId);
      out.push({ youtubeId: v.videoId, title, artist, duration });
    }
  }
  for (const key of Object.keys(obj)) collectVideos(obj[key], out, seen);
}

async function searchViaPublic(
  query: string,
  max: number,
  category: string,
  signal?: AbortSignal
): Promise<Song[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    query
  )}&sp=EgIQAQ%253D%253D`; // sp = filter: type video
  const res = await fetch(url, {
    signal,
    headers: {
      "user-agent": UA,
      "accept-language": "en-IN,en;q=0.9,hi;q=0.8",
      accept: "text/html,application/xhtml+xml",
    },
    // The results page is multi-MB of HTML — far past Next's data-cache limit,
    // so we skip that cache entirely and rely on our own parsed in-memory cache.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`youtube-public ${res.status}`);
  const html = await res.text();
  const data = extractInitialData(html);
  if (!data) throw new Error("youtube-public: unparsable response");
  const raw: RawResult[] = [];
  collectVideos(data, raw, new Set());
  return raw.slice(0, max).map((r) => normalize(r, category));
}

/* ------------------------------ Public API ------------------------------ */

export async function searchYouTube(
  query: string,
  opts: { max?: number; category?: string; signal?: AbortSignal } = {}
): Promise<{ results: Song[]; source: SearchSource; cached: boolean }> {
  const max = opts.max ?? 24;
  const category = opts.category ?? "Search";
  const trimmed = query.trim();
  if (!trimmed) return { results: [], source: "catalog", cached: false };

  const cacheKey = `${trimmed.toLowerCase()}::${max}::${category}`;
  const hit = cacheGet(cacheKey);
  if (hit) return { results: hit.results, source: hit.source, cached: true };

  try {
    const viaApi = await searchViaApi(trimmed, max, category, opts.signal);
    if (viaApi && viaApi.length) {
      cacheSet(cacheKey, viaApi, "youtube-api");
      return { results: viaApi, source: "youtube-api", cached: false };
    }
  } catch (err) {
    console.error("[youtube] data-api failed:", (err as Error).message);
  }

  try {
    const viaPublic = await searchViaPublic(trimmed, max, category, opts.signal);
    if (viaPublic.length) {
      cacheSet(cacheKey, viaPublic, "youtube-public");
      return { results: viaPublic, source: "youtube-public", cached: false };
    }
  } catch (err) {
    console.error("[youtube] public search failed:", (err as Error).message);
  }

  // Last resort: the bundled catalog (still real YouTube data, just not live).
  const local = searchCatalog(trimmed, max);
  return { results: local, source: "catalog", cached: false };
}
