import { ImageResponse } from "next/og";
import { SITE, DEV } from "@/lib/site";

export const runtime = "edge";
export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #140c0d 0%, #0b0708 55%, #1a0f08 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg,#ffd390,#e8a33d,#c9662b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            🎧
          </div>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Nostalgic Music Player
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
            Your memories,
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              background: "linear-gradient(110deg,#ffd9a8,#e8a33d,#c9662b)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            one song at a time.
          </div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
            Old Songs · Singles · Trending · Chhath · Bhojpuri
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <div>Made with ❤️ by {DEV.name}</div>
          <div>{DEV.fullName}</div>
        </div>
      </div>
    ),
    size
  );
}
