import rawCatalog from "@/data/seed-catalog.json";
import type { Catalog, GroupKey, Song } from "./types";

/**
 * Centralized music data layer.
 *
 * Every entry in data/seed-catalog.json was harvested from real YouTube search
 * results (title / channel / duration as reported by YouTube). Nothing here is
 * invented — no fake singers, no fake view counts, no fabricated rankings.
 */

function dedupe(songs: Song[]): Song[] {
  const seen = new Set<string>();
  const out: Song[] = [];
  for (const song of songs) {
    if (!song?.youtubeId || seen.has(song.youtubeId)) continue;
    seen.add(song.youtubeId);
    out.push({ ...song, source: "youtube" });
  }
  return out;
}

const parsed = rawCatalog as unknown as Catalog;

export const catalog: Catalog = {
  oldSongs: dedupe(parsed.oldSongs ?? []),
  singleSongs: dedupe(parsed.singleSongs ?? []),
  trending: dedupe(parsed.trending ?? []),
  chhathPuja: dedupe(parsed.chhathPuja ?? []),
  bhojpuri: dedupe(parsed.bhojpuri ?? []),
};

export const allSongs: Song[] = dedupe([
  ...catalog.oldSongs,
  ...catalog.singleSongs,
  ...catalog.trending,
  ...catalog.chhathPuja,
  ...catalog.bhojpuri,
]);

export const CATEGORY_ORDER: Record<GroupKey, string[]> = {
  oldSongs: [
    "90s Hits",
    "2000s Hits",
    "Evergreen",
    "Old Bollywood",
    "Romantic Classics",
    "Sad Classics",
    "Retro Hits",
  ],
  singleSongs: ["Singles"],
  trending: [
    "Trending Now",
    "New Songs",
    "Popular Hindi",
    "Viral Songs",
    "Popular Regional",
    "New Bhojpuri",
  ],
  chhathPuja: [
    "Chhath Geet",
    "Traditional Chhath",
    "Popular Chhath Songs",
    "Chhath Bhajan",
    "Chhath Special",
    "Latest Chhath Songs",
  ],
  bhojpuri: [
    "Bhojpuri Hits",
    "Classic Bhojpuri",
    "New Bhojpuri",
    "Bhojpuri Folk",
    "Bhojpuri Bhakti",
    "Popular Artists",
  ],
};

/** Discovery queries used by the live YouTube layer, per group + category. */
export const DISCOVERY_QUERIES: Record<GroupKey, Record<string, string>> = {
  oldSongs: {
    "90s Hits": "90s hindi songs",
    "2000s Hits": "2000s hindi songs",
    Evergreen: "evergreen bollywood songs",
    "Old Bollywood": "old bollywood songs",
    "Romantic Classics": "old romantic hindi songs",
    "Sad Classics": "old sad hindi songs",
    "Retro Hits": "retro bollywood hits",
  },
  singleSongs: { Singles: "hindi single song" },
  trending: {
    "Trending Now": "trending hindi songs",
    "New Songs": "new hindi songs",
    "Popular Hindi": "popular hindi songs",
    "Viral Songs": "viral hindi songs",
    "Popular Regional": "popular punjabi songs",
    "New Bhojpuri": "new bhojpuri song",
  },
  chhathPuja: {
    "Chhath Geet": "chhath puja geet",
    "Traditional Chhath": "traditional chhath geet",
    "Popular Chhath Songs": "chhath puja song",
    "Chhath Bhajan": "chhath bhajan",
    "Chhath Special": "chhath puja special song",
    "Latest Chhath Songs": "new chhath geet",
  },
  bhojpuri: {
    "Bhojpuri Hits": "bhojpuri hit songs",
    "Classic Bhojpuri": "old bhojpuri songs",
    "New Bhojpuri": "new bhojpuri song",
    "Bhojpuri Folk": "bhojpuri folk song",
    "Bhojpuri Bhakti": "bhojpuri bhakti song",
    "Popular Artists": "pawan singh bhojpuri song",
  },
};

export function songsByCategory(group: GroupKey): { category: string; songs: Song[] }[] {
  const songs = catalog[group];
  const order = CATEGORY_ORDER[group];
  const buckets = new Map<string, Song[]>();
  for (const c of order) buckets.set(c, []);
  for (const song of songs) {
    if (!buckets.has(song.category)) buckets.set(song.category, []);
    buckets.get(song.category)!.push(song);
  }
  return [...buckets.entries()]
    .map(([category, list]) => ({ category, songs: list }))
    .filter((b) => b.songs.length > 0);
}

export function getGroup(group: GroupKey): Song[] {
  return catalog[group];
}

export function findSong(id: string): Song | undefined {
  return allSongs.find((s) => s.id === id || s.youtubeId === id);
}

/** Lightweight local search over the bundled catalog (used as fallback). */
export function searchCatalog(query: string, limit = 30): Song[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const scored = allSongs
    .map((song) => {
      const haystack = `${song.title} ${song.artist} ${song.category} ${song.language ?? ""}`.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (haystack.includes(t)) score += 1;
        if (song.title.toLowerCase().includes(t)) score += 1;
      }
      return { song, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.song);
}
