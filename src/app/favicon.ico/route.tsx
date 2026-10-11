import { ImageResponse } from "next/og";

export const dynamic = "force-static";

/** Legacy /favicon.ico requests (crawlers, old browsers) get the same ">_" icon as a 48px PNG. */
export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0e0b", borderRadius: 10 }}>
        <svg width="40" height="40" viewBox="0 0 64 64">
          <path d="M15 19 L30 32 L15 45" fill="none" stroke="#22c55e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="34" y="40" width="17" height="7" rx="2" fill="#22c55e" />
        </svg>
      </div>
    ),
    { width: 48, height: 48 },
  );
}
