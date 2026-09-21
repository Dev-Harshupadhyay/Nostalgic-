/** Normalized music model used across the whole app. */
export type Song = {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  category: string;
  language?: string;
  year?: string;
  source: "youtube";
};

export type GroupKey =
  | "evergreen"
  | "oldSongs"
  | "singleSongs"
  | "trending"
  | "chhathPuja"
  | "bhojpuri";

export type Catalog = Record<GroupKey, Song[]>;

export type RepeatMode = "off" | "all" | "one";

export type PlayerStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "buffering"
  | "ended"
  | "error";

export type SearchResponse = {
  results: Song[];
  query: string;
  source: "youtube-api" | "youtube-public" | "catalog";
  cached?: boolean;
};
