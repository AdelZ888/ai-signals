import { ImageResponse } from "next/og";

export const runtime = "edge";

function clamp(value: string | null, max: number, fallback: string): string {
  const v = String(value ?? "").trim() || fallback;
  return v.length <= max ? v : `${v.slice(0, max - 1).trimEnd()}…`;
}

export function GET(req: Request) {
  const url = new URL(req.url);
  const title = clamp(url.searchParams.get("title"), 90, "AI Signals");
  const subtitle = clamp(url.searchParams.get("subtitle"), 120, "Every AI model's price, tracked daily.");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0a0e0b", color: "#c8f5d8", padding: 64 }}>
        <div style={{ display: "flex", color: "#22c55e", fontSize: 32, fontWeight: 700 }}>&gt; ai_signals_</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 60, color: "#e9fff1", fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 30, color: "#7ea58c", marginTop: 20 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#4f6e5a", borderTop: "2px solid #1d2a21", paddingTop: 20 }}>aisignals.dev · prices updated daily</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
