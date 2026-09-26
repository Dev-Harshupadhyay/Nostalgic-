import "server-only";
import type { Song } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
const CACHE_TTL = 1000 * 60 * 15;
const MAX_ITEMS = 100;

type PlaylistSource = "youtube-api" | "youtube-public";
export type PublicPlaylist = {
  id: string;
  title: string;
  channel?: string;
  thumbnail?: string;
  songs: Song[];
  source: PlaylistSource;
  cached: boolean;
};

type PlaylistCacheEntry = {
  at: number;
  playlist: Omit<PublicPlaylist, "cached">;
};
const cache = new Map<string, PlaylistCacheEntry>();

/** A predictable error shape for the API route and the UI. */
export class PlaylistError extends Error {
  constructor(
    public readonly code: "INVALID_URL" | "PRIVATE" | "UNAVAILABLE",
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "PlaylistError";
  }
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

function textFrom(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const item = value as { simpleText?: string; runs?: { text?: string }[] };
  if (item.simpleText) return item.simpleText;
  return (item.runs ?? []).map((run) => run.text ?? "").join("");
}

function bestThumbnail(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const thumbs = (value as { thumbnails?: { url?: string; width?: number }[] }).thumbnails ?? [];
  return [...thumbs].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]?.url;
}

function songFromRaw(
  raw: {
    youtubeId: string;
    title: string;
    artist: string;
    duration?: string;
    thumbnail?: string;
  },
  category: string
): Song {
  return {
    id: `yt-${raw.youtubeId}`,
    youtubeId: raw.youtubeId,
    title: decodeEntities(raw.title),
    artist: decodeEntities(raw.artist),
    thumbnail: raw.thumbnail || thumbFor(raw.youtubeId),
    duration: raw.duration,
    category,
    source: "youtube",
  };
}

/**
 * Reads a playlist id from a normal YouTube / YouTube Music URL. We deliberately
 * fetch only the id from youtube.com later, never a user-provided arbitrary URL.
 */
export function playlistIdFromInput(input: string): string {
  const candidate = input.trim();
  if (!candidate) {
    throw new PlaylistError("INVALID_URL", "Paste a YouTube playlist link first.", 400);
  }

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`);
  } catch {
    throw new PlaylistError("INVALID_URL", "Ye valid YouTube playlist link nahi hai.", 400);
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "music.youtube.com") {
    throw new PlaylistError("INVALID_URL", "Sirf YouTube playlist ka link paste kijiye.", 400);
  }

  const id = url.searchParams.get("list")?.trim() ?? "";

  // Watch Later cannot be read from a public server and should receive the same
  // helpful instruction as a private playlist.
  if (id === "WL") {
    throw new PlaylistError("PRIVATE", "Aapki playlist private hai. YouTube par use Public kijiye, phir link paste karke try karein.", 403);
  }
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(id)) {
    throw new PlaylistError("INVALID_URL", "Link me playlist ID nahi mila. YouTube ka poora playlist link paste kijiye.", 400);
  }
  return id;
}

function cacheKey(id: string, max: number) {
  return `${id}:${max}`;
}

function getCached(id: string, max: number): PublicPlaylist | null {
  const hit = cache.get(cacheKey(id, max));
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL) {
    cache.delete(id);
    return null;
  }
  return { ...hit.playlist, cached: true };
}

function setCached(playlist: Omit<PublicPlaylist, "cached">, max: number) {
  if (cache.size >= 80) cache.delete(cache.keys().next().value as string);
  cache.set(cacheKey(playlist.id, max), { at: Date.now(), playlist });
}

/* ------------------------- Official YouTube Data API ------------------------- */

type ApiPlaylistItem = {
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: Record<string, { url?: string; width?: number }>;
    resourceId?: { videoId?: string };
  };
  contentDetails?: { videoId?: string };
};

async function playlistViaApi(id: string, max: number): Promise<Omit<PublicPlaylist, "cached"> | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;

  const metaUrl = new URL("https://www.googleapis.com/youtube/v3/playlists");
  metaUrl.searchParams.set("part", "snippet,status");
  metaUrl.searchParams.set("id", id);
  metaUrl.searchParams.set("key", key);
  const metaRes = await fetch(metaUrl, { next: { revalidate: 900 } });
  if (!metaRes.ok) throw new Error(`youtube playlist API ${metaRes.status}`);
  const meta = (await metaRes.json()) as {
    items?: {
      snippet?: { title?: string; channelTitle?: string; thumbnails?: Record<string, { url?: string; width?: number }> };
      status?: { privacyStatus?: string };
    }[];
  };
  const info = meta.items?.[0];
  if (!info || info.status?.privacyStatus !== "public") {
    throw new PlaylistError(
      "PRIVATE",
      "Aapki playlist private hai. YouTube par use Public kijiye, phir link paste karke try karein.",
      403
    );
  }

  const items: ApiPlaylistItem[] = [];
  let pageToken: string | undefined;
  do {
    const listUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    listUrl.searchParams.set("part", "snippet,contentDetails");
    listUrl.searchParams.set("playlistId", id);
    listUrl.searchParams.set("maxResults", String(Math.min(50, max - items.length)));
    listUrl.searchParams.set("key", key);
    if (pageToken) listUrl.searchParams.set("pageToken", pageToken);
    const listRes = await fetch(listUrl, { next: { revalidate: 900 } });
    if (!listRes.ok) throw new Error(`youtube playlist items API ${listRes.status}`);
    const page = (await listRes.json()) as { items?: ApiPlaylistItem[]; nextPageToken?: string };
    items.push(...(page.items ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken && items.length < max);

  const raw = items
    .map((item) => {
      const videoId = item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
      const thumbs = item.snippet?.thumbnails ?? {};
      const thumbnail =
        thumbs.maxres?.url ?? thumbs.standard?.url ?? thumbs.high?.url ?? thumbs.medium?.url ?? thumbs.default?.url;
      return {
        youtubeId: videoId ?? "",
        title: item.snippet?.title ?? "",
        artist: item.snippet?.channelTitle ?? "",
        thumbnail,
      };
    })
    .filter((item) => item.youtubeId && item.title && !/^(private|deleted) video$/i.test(item.title));

  const details = new Map<string, { duration?: string; embeddable?: boolean; public?: boolean }>();
  for (let i = 0; i < raw.length; i += 50) {
    const ids = raw.slice(i, i + 50).map((item) => item.youtubeId).join(",");
    if (!ids) continue;
    const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    detailsUrl.searchParams.set("part", "contentDetails,status");
    detailsUrl.searchParams.set("id", ids);
    detailsUrl.searchParams.set("key", key);
    const detailsRes = await fetch(detailsUrl, { next: { revalidate: 900 } });
    if (!detailsRes.ok) continue;
    const data = (await detailsRes.json()) as {
      items?: { id?: string; contentDetails?: { duration?: string }; status?: { embeddable?: boolean; privacyStatus?: string } }[];
    };
    for (const video of data.items ?? []) {
      if (!video.id) continue;
      details.set(video.id, {
        duration: isoToClock(video.contentDetails?.duration),
        embeddable: video.status?.embeddable,
        public: video.status?.privacyStatus === "public" || video.status?.privacyStatus === "unlisted",
      });
    }
  }

  const songs = raw
    .filter((item) => {
      const detail = details.get(item.youtubeId);
      return !detail || (detail.embeddable !== false && detail.public !== false);
    })
    .map((item) => songFromRaw({ ...item, duration: details.get(item.youtubeId)?.duration }, "My Playlist"));

  return {
    id,
    title: decodeEntities(info.snippet?.title ?? "My Playlist"),
    channel: decodeEntities(info.snippet?.channelTitle ?? ""),
    thumbnail: bestThumbnail(info.snippet?.thumbnails),
    songs,
    source: "youtube-api",
  };
}

/* -------------------------- Keyless public fallback ------------------------- */

/** Extracts JSON after an assignment, without being confused by nested braces in strings. */
function jsonAssignedAfter(html: string, marker: string): unknown | null {
  const markerAt = html.indexOf(marker);
  if (markerAt < 0) return null;
  const start = html.indexOf("{", markerAt + marker.length);
  if (start < 0) return null;

  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let i = start; i < html.length; i += 1) {
    const char = html[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function findRenderer(node: unknown, name: string): Record<string, any> | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findRenderer(child, name);
      if (found) return found;
    }
    return null;
  }
  const obj = node as Record<string, any>;
  if (obj[name] && typeof obj[name] === "object") return obj[name];
  for (const value of Object.values(obj)) {
    const found = findRenderer(value, name);
    if (found) return found;
  }
  return null;
}

function collectPlaylistVideos(
  node: unknown,
  out: { youtubeId: string; title: string; artist: string; duration?: string; thumbnail?: string }[],
  seen: Set<string>
) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) collectPlaylistVideos(child, out, seen);
    return;
  }
  const obj = node as Record<string, any>;
  const video = obj.playlistVideoRenderer;
  if (video?.videoId && !seen.has(video.videoId)) {
    const title = textFrom(video.title);
    if (title && !/^(private|deleted) video$/i.test(title)) {
      seen.add(video.videoId);
      out.push({
        youtubeId: video.videoId,
        title,
        artist: textFrom(video.shortBylineText) || textFrom(video.longBylineText) || textFrom(video.videoInfo),
        duration: textFrom(video.lengthText) || undefined,
        thumbnail: bestThumbnail(video.thumbnail),
      });
    }
  }
  for (const value of Object.values(obj)) collectPlaylistVideos(value, out, seen);
}

function imageSource(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const sources = (value as { sources?: { url?: string; width?: number }[] }).sources ?? [];
  return [...sources].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]?.url;
}

/**
 * In late 2025 YouTube started returning playlist items as lockupViewModel
 * rather than playlistVideoRenderer. Read both shapes so the keyless fallback
 * stays useful across the two public page variants.
 */
function collectLockupVideos(
  node: unknown,
  out: { youtubeId: string; title: string; artist: string; duration?: string; thumbnail?: string }[],
  seen: Set<string>
) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) collectLockupVideos(child, out, seen);
    return;
  }
  const obj = node as Record<string, any>;
  const lockup = obj.lockupViewModel;
  if (lockup?.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" && lockup.contentId && !seen.has(lockup.contentId)) {
    const metadata = lockup.metadata?.lockupMetadataViewModel;
    const title = metadata?.title?.content ?? textFrom(metadata?.title);
    const author = metadata?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content ?? "";
    const badges = lockup.contentImage?.thumbnailViewModel?.overlays ?? [];
    const duration = badges
      .flatMap((overlay: Record<string, any>) => overlay.thumbnailBottomOverlayViewModel?.badges ?? [])
      .map((badge: Record<string, any>) => badge.thumbnailBadgeViewModel?.text ?? "")
      .find((text: string) => /^\d{1,2}:\d{2}(?::\d{2})?$/.test(text));
    if (title) {
      seen.add(lockup.contentId);
      out.push({
        youtubeId: lockup.contentId,
        title,
        artist: author,
        duration,
        thumbnail: imageSource(lockup.contentImage?.thumbnailViewModel?.image),
      });
    }
  }
  for (const value of Object.values(obj)) collectLockupVideos(value, out, seen);
}

function getPublicPlaylistTitle(data: unknown): { title?: string; channel?: string; thumbnail?: string } {
  const metadata = findRenderer(data, "playlistMetadataRenderer");
  const header = findRenderer(data, "playlistHeaderRenderer");
  const sidebar = findRenderer(data, "playlistSidebarPrimaryInfoRenderer");
  const title =
    textFrom(metadata?.title) || textFrom(header?.title) || textFrom(sidebar?.title) || undefined;
  return {
    title,
    channel: textFrom(header?.ownerText) || textFrom(sidebar?.owner?.runs?.[0]) || undefined,
    thumbnail: bestThumbnail(header?.playlistHeaderBanner?.heroPlaylistThumbnailRenderer?.thumbnail),
  };
}

async function playlistViaPublic(id: string, max: number): Promise<Omit<PublicPlaylist, "cached">> {
  const url = `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}&hl=en&gl=IN`;
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      "accept-language": "en-IN,en;q=0.9,hi;q=0.8",
      accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`youtube public playlist ${res.status}`);
  const html = await res.text();

  if (/this playlist is private|private playlist|playlist is unavailable|this playlist does not exist/i.test(html)) {
    throw new PlaylistError(
      "PRIVATE",
      "Aapki playlist private hai. YouTube par use Public kijiye, phir link paste karke try karein.",
      403
    );
  }

  const data =
    jsonAssignedAfter(html, "var ytInitialData =") ??
    jsonAssignedAfter(html, "ytInitialData =") ??
    jsonAssignedAfter(html, 'window["ytInitialData"] =');
  if (!data) throw new Error("youtube public playlist response could not be read");

  const raw: { youtubeId: string; title: string; artist: string; duration?: string; thumbnail?: string }[] = [];
  const seen = new Set<string>();
  collectPlaylistVideos(data, raw, seen);
  collectLockupVideos(data, raw, seen);
  const details = getPublicPlaylistTitle(data);
  const songs = raw.slice(0, max).map((item) => songFromRaw(item, "My Playlist"));

  // A valid public playlist may genuinely be empty. A missing title plus no
  // videos, however, is YouTube's usual inaccessible/deleted-playlist page.
  if (!details.title && songs.length === 0) {
    throw new PlaylistError(
      "PRIVATE",
      "Aapki playlist private hai ya available nahi hai. YouTube par use Public kijiye, phir link paste karke try karein.",
      403
    );
  }

  return {
    id,
    title: details.title ? decodeEntities(details.title) : "My Playlist",
    channel: details.channel ? decodeEntities(details.channel) : undefined,
    thumbnail: details.thumbnail,
    songs,
    source: "youtube-public",
  };
}

/**
 * Fetches up to 100 songs from one public YouTube playlist.
 *
 * A playlist is a moving target — its owner can add a song a minute from now.
 * `force` skips the 15-minute memo so a Refresh in the UI really does re-read
 * the playlist from YouTube instead of replaying a stale copy.
 */
export async function getPublicPlaylist(
  input: string,
  max = MAX_ITEMS,
  options: { force?: boolean } = {}
): Promise<PublicPlaylist> {
  const id = playlistIdFromInput(input);
  const limit = Math.min(Math.max(max, 1), MAX_ITEMS);
  if (!options.force) {
    const cached = getCached(id, limit);
    if (cached) return cached;
  }

  try {
    const viaApi = await playlistViaApi(id, limit);
    if (viaApi) {
      setCached(viaApi, limit);
      return { ...viaApi, cached: false };
    }
  } catch (error) {
    if (error instanceof PlaylistError) throw error;
    console.error("[youtube playlist] data-api failed:", (error as Error).message);
  }

  try {
    const viaPublic = await playlistViaPublic(id, limit);
    setCached(viaPublic, limit);
    return { ...viaPublic, cached: false };
  } catch (error) {
    if (error instanceof PlaylistError) throw error;
    console.error("[youtube playlist] public fetch failed:", (error as Error).message);
    throw new PlaylistError(
      "UNAVAILABLE",
      "Playlist abhi fetch nahi ho pa rahi. Link check karke dobara try karein.",
      503
    );
  }
}
