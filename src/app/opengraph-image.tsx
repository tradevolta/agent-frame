import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

export const alt = `${brand.name}: AI headshots for real estate agents`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", background: "#2446a6", color: "white", padding: 80 }}>
        <div style={{ fontSize: 34, color: "#dbe3f7", fontWeight: 700 }}>{brand.name}</div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginTop: 20 }}>Realtor headshots that look like you.</div>
        <div style={{ fontSize: 36, marginTop: 24, opacity: 0.85 }}>12 real estate styles + Just Listed & Open House graphics. Ready in an hour.</div>
      </div>
    ),
    size,
  );
}
