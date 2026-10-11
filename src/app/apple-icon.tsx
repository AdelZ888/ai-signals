import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Same ">_" prompt as icon.svg, rendered as a PNG for iOS home screens. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0e0b" }}>
        <svg width="140" height="140" viewBox="0 0 64 64">
          <path d="M15 19 L30 32 L15 45" fill="none" stroke="#22c55e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="34" y="40" width="17" height="7" rx="2" fill="#22c55e" />
        </svg>
      </div>
    ),
    size,
  );
}
