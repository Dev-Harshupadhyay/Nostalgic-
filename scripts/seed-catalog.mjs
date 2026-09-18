/**
 * Builds data/seed-catalog.json from REAL YouTube search results.
 * No data is invented: every title/artist/duration/thumbnail comes straight
 * from YouTube's own search response. Views/rankings are deliberately NOT stored.
 *
 * Run:  node scripts/seed-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

const napms = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHtml(url, attempt = 0) {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, "accept-language": "en-IN,en;q=0.9,hi;q=0.8" },
    });
    if (!res.ok) throw new Error("status " + res.status);
    return await res.text();
  } catch (e) {
    if (attempt >= 5) throw e;
    const back = 4000 * Math.pow(2, attempt);
    console.log("  retry in", back, "ms ...", e.message);
    await napms(back);
    return fetchHtml(url, attempt + 1);
  }
}

async function search(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    query
  )}&sp=EgIQAQ%253D%253D`;
  const html = await fetchHtml(url);
  const m = html.match(/ytInitialData\s*=\s*(\{.+?\});<\/script>/s);
  if (!m) return [];
  const data = JSON.parse(m[1]);
  const out = [];
  const seen = new Set();
  (function walk(n) {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    const v = n.videoRenderer;
    if (v && v.videoId && !seen.has(v.videoId)) {
      seen.add(v.videoId);
      const title = v.title?.runs?.map((r) => r.text).join("") ?? "";
      const artist =
        v.ownerText?.runs?.[0]?.text ?? v.longBylineText?.runs?.[0]?.text ?? "";
      const duration = v.lengthText?.simpleText ?? "";
      if (title && duration) out.push({ youtubeId: v.videoId, title, artist, duration });
    }
    for (const k in n) walk(n[k]);
  })(data);
  return out;
}

const GROUPS = {
  oldSongs: {
    "90s Hits": ["90s hindi songs", "90s hit hindi songs kumar sanu alka yagnik"],
    "2000s Hits": ["2000s hindi songs", "2000s bollywood hit songs"],
    Evergreen: ["evergreen bollywood songs", "evergreen hindi songs lata mangeshkar"],
    "Old Bollywood": ["old bollywood songs", "purane hindi gaane mohammed rafi"],
    "Romantic Classics": ["old romantic hindi songs", "romantic classic bollywood songs"],
    "Sad Classics": ["old sad hindi songs", "sad classic bollywood songs"],
    "Retro Hits": ["retro bollywood hits", "retro hindi songs kishore kumar"],
  },
  trending: {
    "Trending Now": ["trending hindi songs"],
    "New Songs": ["new hindi songs 2026", "latest hindi songs"],
    "Popular Hindi": ["popular hindi songs"],
    "Viral Songs": ["viral hindi songs"],
    "Popular Regional": ["popular punjabi songs", "popular haryanvi songs"],
    "New Bhojpuri": ["new bhojpuri song 2026"],
  },
  chhathPuja: {
    "Chhath Geet": ["chhath puja geet"],
    "Traditional Chhath": ["traditional chhath geet sharda sinha"],
    "Popular Chhath Songs": ["chhath puja song"],
    "Chhath Bhajan": ["chhath bhajan"],
    "Chhath Special": ["chhath puja special song"],
    "Latest Chhath Songs": ["new chhath geet 2026"],
  },
  bhojpuri: {
    "Bhojpuri Hits": ["bhojpuri hit songs"],
    "Classic Bhojpuri": ["old bhojpuri songs"],
    "New Bhojpuri": ["new bhojpuri song"],
    "Bhojpuri Folk": ["bhojpuri folk song", "bhojpuri lokgeet"],
    "Bhojpuri Bhakti": ["bhojpuri bhakti song", "bhojpuri devi geet"],
    "Popular Artists": ["pawan singh bhojpuri song", "khesari lal yadav song"],
  },
  singleSongs: {
    Singles: ["hindi single song", "best hindi songs one song"],
  },
};

const LANG = {
  oldSongs: "Hindi",
  trending: "Hindi",
  chhathPuja: "Bhojpuri",
  bhojpuri: "Bhojpuri",
  singleSongs: "Hindi",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let catalog = {};
try {
  catalog = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "seed-catalog.json"), "utf8"));
} catch {}
const globalSeen = new Set();
for (const arr of Object.values(catalog)) for (const s of arr) globalSeen.add(s.youtubeId);

for (const [group, cats] of Object.entries(GROUPS)) {
  if (Array.isArray(catalog[group]) && catalog[group].length >= 30) {
    console.log("skip (already seeded)", group, catalog[group].length);
    continue;
  }
  catalog[group] = catalog[group] ?? [];
  const doneCats = new Set(catalog[group].map((s) => s.category));
  for (const [category, queries] of Object.entries(cats)) {
    if (doneCats.has(category)) { console.log("  skip cat", category); continue; }
    let picked = 0;
    for (const q of queries) {
      let results = [];
      try {
        results = await search(q);
      } catch (e) {
        console.error("fail", q, e.message);
      }
      for (const r of results) {
        if (globalSeen.has(r.youtubeId)) continue;
        if (picked >= 14) break;
        globalSeen.add(r.youtubeId);
        picked++;
        catalog[group].push({
          id: `${group}-${r.youtubeId}`,
          youtubeId: r.youtubeId,
          title: r.title,
          artist: r.artist,
          thumbnail: `https://i.ytimg.com/vi/${r.youtubeId}/hqdefault.jpg`,
          duration: r.duration,
          category,
          language: LANG[group],
          source: "youtube",
        });
      }
      await sleep(2500);
      if (picked >= 14) break;
    }
    console.log(group, "/", category, "->", picked);
    fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
    fs.writeFileSync(path.join(process.cwd(), "data", "seed-catalog.json"), JSON.stringify(catalog, null, 2));
  }
}

const outPath = path.join(process.cwd(), "data", "seed-catalog.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2));
console.log(
  "written",
  outPath,
  Object.entries(catalog).map(([k, v]) => `${k}:${v.length}`).join(" ")
);
