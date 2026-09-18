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

type CacheEntry = {
  at: number;
  results: Song[];
  source: SearchSource;
  nextPageToken?: string;
};
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

function cacheSet(
  key: string,
  results: Song[],
  source: SearchSource,
  nextPageToken?: string
) {
  if (cache.size > 120) cache.delete(cache.keys().next().value as string);
  cache.set(key, { at: Date.now(), results, source, nextPageToken });
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
  raw: {
    youtubeId: string;
    title: string;
    artist: string;
    duration?: string;
    year?: string;
    thumbnail?: string;
  },
  category: string,
  language?: string
): Song {
  return {
    id: `yt-${raw.youtubeId}`,
    youtubeId: raw.youtubeId,
    title: raw.title,
    artist: raw.artist,
    // Prefer the thumbnail YouTube itself returned; fall back to the canonical
    // i.ytimg.com path for the same video. Never synthesised artwork.
    thumbnail: raw.thumbnail || thumbFor(raw.youtubeId),
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
  signal?: AbortSignal,
  pageToken?: string
): Promise<{ results: Song[]; nextPageToken?: string } | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(Math.min(max, 25)));
  url.searchParams.set("regionCode", "IN");
  url.searchParams.set("relevanceLanguage", "hi");
  // Only surface videos we are actually allowed to embed in the IFrame player.
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("videoCategoryId", "10");
  url.searchParams.set("key", key);
  if (pageToken) url.searchParams.set("pageToken", pageToken);

  const res = await fetch(url, { signal, next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`youtube-api ${res.status}`);
  const data = (await res.json()) as {
    nextPageToken?: string;
    items?: {
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        channelTitle?: string;
        publishedAt?: string;
        thumbnails?: Record<string, { url?: string; width?: number }>;
      };
    }[];
  };

  const items = (data.items ?? []).filter((i) => i.id?.videoId);
  const ids = items.map((i) => i.id!.videoId!).join(",");

  /* contentDetails gives us the real runtime; status.embeddable is a second
     guard because the search filter alone occasionally lets a blocked video
     through, and an unplayable row is worse than a missing one. */
  const durations = new Map<string, string>();
  const blocked = new Set<string>();
  if (ids) {
    try {
      const dUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      dUrl.searchParams.set("part", "contentDetails,status");
      dUrl.searchParams.set("id", ids);
      dUrl.searchParams.set("key", key);
      const dRes = await fetch(dUrl, { signal, next: { revalidate: 1800 } });
      if (dRes.ok) {
        const dData = (await dRes.json()) as {
          items?: {
            id: string;
            contentDetails?: { duration?: string };
            status?: { embeddable?: boolean };
          }[];
        };
        for (const it of dData.items ?? []) {
          const clock = isoToClock(it.contentDetails?.duration);
          if (clock) durations.set(it.id, clock);
          if (it.status?.embeddable === false) blocked.add(it.id);
        }
      }
    } catch {
      /* durations are optional — never fail the search over them */
    }
  }

  const results = items
    .filter((i) => !blocked.has(i.id!.videoId!))
    .map((i) => {
      const t = i.snippet?.thumbnails ?? {};
      const best =
        t.maxres?.url ?? t.standard?.url ?? t.high?.url ?? t.medium?.url ?? t.default?.url;
      return normalize(
        {
          youtubeId: i.id!.videoId!,
          title: decodeEntities(i.snippet?.title ?? ""),
          artist: decodeEntities(i.snippet?.channelTitle ?? ""),
          duration: durations.get(i.id!.videoId!),
          year: i.snippet?.publishedAt?.slice(0, 4),
          thumbnail: best,
        },
        category
      );
    });

  return { results, nextPageToken: data.nextPageToken };
}

/** YouTube's API returns HTML entities in titles (&amp;, &#39;, &quot;). */
function decodeEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)));
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
      out.push({
        youtubeId: v.videoId,
        title: decodeEntities(title),
        artist: decodeEntities(artist),
        duration,
      });
    }
  }
  for (const key of Object.keys(obj)) collectVideos(obj[key], out, seen);
}

async function searchViaPublic(
  query: string,
  max: number,
  category: string,
  signal?: AbortSignal,
  offset = 0
): Promise<{ results: Song[]; total: number }> {
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
  // The public page has no cursor, so "load more" is served by slicing deeper
  // into the single result set it returns. `total` lets the caller decide
  // whether another page actually exists instead of guessing.
  return {
    results: raw.slice(offset, offset + max).map((r) => normalize(r, category)),
    total: raw.length,
  };
}

/* ------------------------------ Public API ------------------------------ */

export async function searchYouTube(
  query: string,
  opts: {
    max?: number;
    category?: string;
    signal?: AbortSignal;
    /** Data-API cursor, or the string offset used by the keyless fallback. */
    pageToken?: string;
  } = {}
): Promise<{
  results: Song[];
  source: SearchSource;
  cached: boolean;
  nextPageToken?: string;
}> {
  const max = opts.max ?? 24;
  const category = opts.category ?? "Search";
  const trimmed = query.trim();
  const pageToken = opts.pageToken;
  if (!trimmed) return { results: [], source: "catalog", cached: false };

  const cacheKey = `${trimmed.toLowerCase()}::${max}::${category}::${pageToken ?? "p0"}`;
  const hit = cacheGet(cacheKey);
  if (hit) {
    return {
      results: hit.results,
      source: hit.source,
      cached: true,
      nextPageToken: hit.nextPageToken,
    };
  }

  try {
    const viaApi = await searchViaApi(trimmed, max, category, opts.signal, pageToken);
    if (viaApi && viaApi.results.length) {
      cacheSet(cacheKey, viaApi.results, "youtube-api", viaApi.nextPageToken);
      return {
        results: viaApi.results,
        source: "youtube-api",
        cached: false,
        nextPageToken: viaApi.nextPageToken,
      };
    }
  } catch (err) {
    console.error("[youtube] data-api failed:", (err as Error).message);
  }

  try {
    const offset = pageToken ? Number(pageToken) || 0 : 0;
    const viaPublic = await searchViaPublic(trimmed, max, category, opts.signal, offset);
    if (viaPublic.results.length) {
      // Only advertise another page when more raw results really remain.
      const next = offset + max < viaPublic.total ? String(offset + max) : undefined;
      cacheSet(cacheKey, viaPublic.results, "youtube-public", next);
      return {
        results: viaPublic.results,
        source: "youtube-public",
        cached: false,
        nextPageToken: next,
      };
    }
  } catch (err) {
    console.error("[youtube] public search failed:", (err as Error).message);
  }

  // Last resort: the bundled catalog (still real YouTube data, just not live).
  const local = pageToken ? [] : searchCatalog(trimmed, max);
  return { results: local, source: "catalog", cached: false };
}
