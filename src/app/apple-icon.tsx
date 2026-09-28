import { ImageResponse } from "next/og";
import { LogoMark } from "@/lib/logo-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#2446a6", color: "#fdfdfe" }}>
        <LogoMark size={104} color="#fdfdfe" />
      </div>
    ),
    size,
  );
}
