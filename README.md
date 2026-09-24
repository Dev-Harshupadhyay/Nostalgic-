# 🎧 Nostalgic Music Player

**Your memories, one song at a time.**

A premium nostalgic Indian music platform — old Hindi classics, singles, new & trending,
Chhath Puja geet and Bhojpuri favourites, all streamed through the official YouTube player.

Built with ❤️ by [Harsh](https://new-profotilo-flame.vercel.app/).

---

## Features

| Area | What it does |
| --- | --- |
| 🏠 **Home** | Hero, featured shortcuts, Recently Played, Continue Listening, curated shelves |
| 🎵 **Old Songs** | 90s Hits · 2000s Hits · Evergreen · Old Bollywood · Romantic Classics · Sad Classics · Retro Hits |
| 💿 **Singles** | Individual song cards, one song at a time |
| 🔥 **New & Trending** | Live YouTube search results (never fabricated rankings) |
| 🪔 **Chhath Puja** | Chhath Geet · Traditional · Popular · Bhajan · Special · Latest |
| 🎤 **Bhojpuri** | Hits · Classics · New · Folk · Bhakti · Popular Artists |
| 🔎 **Search** | Debounced global search with skeleton, empty and error states |
| 🎶 **My Playlist** | Paste a public YouTube playlist link, fetch up to 100 playable videos, then play, shuffle or queue the whole list |
| ❤️ **Support Dev Harsh** | ₹25 default, ₹50 / ₹100 / custom amount, real UPI deep link |
| ✈️ **Telegram notice** | One gentle official-channel QR notice per browser session; closes itself after five seconds |
| 🛠️ **Developer Dashboard** | About, projects, portfolio and Timepass Premium links |

### Player

- One YouTube IFrame instance, **mounted once for the app's lifetime** — switching songs,
  opening the full player or navigating between tabs never recreates it, so playback
  never restarts or flashes.
- Mini player (sticky, desktop + mobile), full player, queue panel / bottom sheet.
- Play · pause · seek · volume · mute · shuffle · repeat (off/all/one) · next · previous ·
  favourite · share · auto-next.
- Queue: play, remove, reorder, clear, jump-to.
- Recently played, favourites and a resume point persist in `localStorage`.
- Media Session API for Android lock-screen controls.
- Keyboard shortcuts: `Space` play/pause, `Shift+→/←` next/previous, `M` mute, `Esc` close.

---

## Music data

Everything in [`data/seed-catalog.json`](data/seed-catalog.json) was harvested from **real
YouTube search results** — titles, channel names, durations and thumbnails are exactly what
YouTube returned.

**Nothing is invented.** No fake singers, no fake view counts, no fabricated "trending"
rankings. Where a ranking cannot be verified, results are simply presented as search or
curated results.

Normalized model (`lib/types.ts`):

```ts
type Song = {
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
```

Regenerate the catalog at any time:

```bash
node scripts/seed-catalog.mjs   # rebuilds data/seed-catalog.json from live YouTube search
```

---

## YouTube integration

```
Search query → /api/youtube/search → YouTube (API key or public) → normalize → Song[] → React UI
```

Two server-side strategies, in order:

1. **Official YouTube Data API v3** — used automatically when `YOUTUBE_API_KEY` is set.
   Calls `search.list` with `part=snippet`, `type=video`, `maxResults=20`, `regionCode=IN`,
   `relevanceLanguage=hi` and `videoEmbeddable=true`, then `videos.list`
   (`part=contentDetails,status`) to attach real runtimes and drop any video whose
   `status.embeddable` is `false` — an unplayable row is worse than a missing one.
   Supports real `nextPageToken` pagination.
2. **Keyless public search** — parses YouTube's own results page server-side.
   Has no cursor, so "Load more" pages by slicing deeper into the returned set, and only
   advertises another page when more results genuinely remain.
3. **Bundled catalog** — last-resort fallback, clearly reported as `source: "catalog"`.

Thumbnails always come from YouTube itself (highest available of
`maxres → standard → high → medium → default`, falling back to the canonical
`i.ytimg.com/vi/<id>/hqdefault.jpg`). No artwork is ever synthesised, and HTML entities in
titles/channels (`&amp;`, `&#39;`) are decoded before display.

> The API key is read **only** on the server (`lib/youtube.server.ts` is `server-only`) and is
> never prefixed with `NEXT_PUBLIC_`, so it can never reach the browser bundle. The browser
> only ever calls `/api/youtube/search?q=…` and receives normalized `Song[]` objects.

### Public playlist import

`/playlist` accepts only YouTube / YouTube Music links containing a `list` ID. The server never
fetches a caller-supplied host: it extracts and validates the ID, then reads YouTube itself. When
`YOUTUBE_API_KEY` is available, the official playlist endpoints supply the data and validate that
the playlist visibility is `public`. Without a key, the server parses YouTube's public playlist
page. The browser receives normalized `Song[]` only; no imported playlist is stored by the app.
Private, unavailable and Watch Later lists return an explicit instruction to change visibility to
**Public**. The first 100 playable videos are supported.

### Search UX

Debounced live search (420 ms) with request cancellation — a stale response can never
overwrite a newer one (guarded by a monotonic run id *and* `AbortController`). Plus: search on
Enter, a Search button, suggestion chips, loading skeletons, persisted search history
(`nostalgic:searchHistory`), a clear button, lazy-loaded thumbnails, 30-minute server-side
response caching, a "Load more" pager, and distinct no-results / error states. Previous
results stay on screen while a new query is in flight.

Playback is always via the **official YouTube IFrame Player API** — the selected `videoId` is
handed to the existing single, persistent player instance. Nothing is downloaded, scraped for
media URLs, or re-hosted.

### Endpoints

| Route | Purpose |
| --- | --- |
| `GET /api/youtube/search?q=&max=&pageToken=&category=` | Live YouTube search (paginated) |
| `GET /api/youtube/discover?group=&category=` | Refresh one category with live results |
| `GET /api/youtube/playlist?url=&max=` | Fetch up to 100 songs from one public YouTube playlist; private/unavailable lists return a clear 403 message |

---

## Support / payments

The support card builds a standard **UPI deep link** (`upi://pay?pa=…&am=…`) so the user's own
GPay / PhonePe / Paytm app opens with the amount pre-filled.

This site **never processes, stores or confirms a payment** — only the user's UPI app or bank
can do that. No success screen is ever faked. The architecture is ready to plug a real gateway
in later if needed.

---

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm start
```

### Environment variables

Copy `.env.example` to `.env.local`:

```bash
YOUTUBE_API_KEY=            # optional — server-side only, never NEXT_PUBLIC_
NEXT_PUBLIC_SITE_URL=       # canonical URL for SEO / sitemap / Open Graph
```

The app works fully without an API key.

---

## Tech

- **Next.js 15** (App Router) · **React 19** · **TypeScript** (strict) · **Tailwind CSS 4**
- Zero UI dependencies — icons, animations and the player are hand-built
- `@vercel/analytics` + `@vercel/speed-insights`

## Design system

Dark cinematic base, film grain, subtle scanlines, warm nostalgic gradients, glassmorphism,
album-art glow, equalizer bars, retro media-player details — all defined in `app/globals.css`.

Component classes live in Tailwind's `components` layer so plain utilities always win.

## Accessibility & performance

- Semantic HTML, one `<h1>` per page, ARIA labels on every control, `aria-live` toasts
- Keyboard navigation, visible focus rings, focus-trapped dialogs, skip-to-content link
- Full `prefers-reduced-motion` support
- Lazy images, debounced search, memoized cards, IntersectionObserver-driven discovery,
  cleaned-up player listeners, no memory leaks
- Verified with no horizontal overflow from **320px → 1920px**

## SEO

Per-route metadata, canonical URLs, Open Graph + Twitter cards, generated OG image,
SVG favicon, `robots.txt`, `sitemap.xml` and JSON-LD (`WebSite`, `Person`, `SearchAction`).

---

## Project structure

```
app/
  api/youtube/{search,discover}/route.ts   server-side YouTube layer
  {old-songs,singles,trending,chhath,bhojpuri,search,support,developer}/page.tsx
  layout.tsx  page.tsx  globals.css  sitemap.ts  robots.ts  opengraph-image.tsx
components/
  player/    PlayerProvider · MiniPlayer · FullPlayer · PlayerControls · ProgressBar · QueuePanel
  music/     SongCard · SongRow · SongShelf · CategorySection
  layout/    Header · Footer · PageHeader · WelcomeToast
  support/   SupportCard
  dev/       DeveloperDashboard
  ui/        GlowButton · Icons
lib/         catalog.ts · youtube.server.ts · types.ts · format.ts · site.ts
data/        seed-catalog.json
scripts/     seed-catalog.mjs · merge-legacy.mjs
```

---

## Developer

**Harsh Dev** — Creator / Developer / Builder
Focus: Web Development, UI/UX, Music Projects

- 🌐 [Harsh Dev — Portfolio](https://new-profotilo-flame.vercel.app/)
- 🎬 [Timepass Premium](https://timepass-premium.vercel.app/) — another project by Harsh Dev

---

Made with ❤️ by Harsh · © 2026 Harsh Dev · Music Player
