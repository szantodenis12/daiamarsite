import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Shared look for the generated share images: white card, navy type, brand rule, Oradea line.
export function ogImage(title: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#ffffff",
          color: "#0f1b2d",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: title.length > 48 ? 60 : 72, fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.02em", maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "3px solid #245482", paddingTop: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 40, fontWeight: 700 }}>Daiamar</div>
            <div style={{ fontSize: 24, color: "#5b6676" }}>Str. Beiușului nr. 52, Oradea · membră CECCAR</div>
          </div>
          <div style={{ fontSize: 26, color: "#5b6676" }}>www.daiamar.ro</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
