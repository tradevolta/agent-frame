import { ImageResponse } from "next/og";
import { LogoMark } from "@/lib/logo-mark";

// App icon and the logo in Organization structured data: the header mark.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#2446a6", borderRadius: 112, color: "#fdfdfe" }}>
        <LogoMark size={288} color="#fdfdfe" />
      </div>
    ),
    size,
  );
}
