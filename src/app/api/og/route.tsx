import { ImageResponse } from "next/og";

export const runtime = "edge";

const WIDTH = 1200;
const HEIGHT = 630;

function clamp(input: string, max: number) {
  const value = String(input || "").trim();
  if (value.length <= max) return value;
  return value.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

function safeParam(url: URL, key: string, fallback = "") {
  return clamp(url.searchParams.get(key) || fallback, 220);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = (url.searchParams.get("locale") || "en").toLowerCase() === "fr" ? "fr" : "en";
  const kind = (url.searchParams.get("kind") || "post").toLowerCase(); // post|newsletter|page

  const title = safeParam(url, "title", locale === "fr" ? "AI Signals" : "AI Signals");
  const subtitle = safeParam(
    url,
    "subtitle",
    locale === "fr"
      ? "Actus IA, agents, tutoriels. Axe builders."
      : "AI news, agents, tutorials. Builder-focused.",
  );

  const kicker =
    safeParam(
      url,
      "kicker",
      kind === "newsletter"
        ? locale === "fr"
          ? "Newsletter"
          : "Newsletter"
        : locale === "fr"
          ? "Briefing"
          : "Briefing",
    ) || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "radial-gradient(circle at 20% 10%, rgba(34,211,238,0.22), transparent 55%), radial-gradient(circle at 80% 30%, rgba(245,158,11,0.18), transparent 60%), #060914",
          color: "#f8fafc",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "radial-gradient(circle at 30% 30%, #22d3ee, rgba(245,158,11,0.95))",
              boxShadow: "0 0 0 10px rgba(34,211,238,0.10)",
            }}
          />
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.4 }}>AI Signals</div>
          <div
            style={{
              marginLeft: 10,
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.25)",
              background: "rgba(2,6,23,0.35)",
              fontSize: 12,
              letterSpacing: 2.6,
              textTransform: "uppercase",
              color: "#67e8f9",
              fontWeight: 800,
            }}
          >
            {kicker}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingRight: 24 }}>
          <div
            style={{
              fontSize: 70,
              fontWeight: 950,
              letterSpacing: -2.2,
              lineHeight: 1.04,
              textWrap: "balance",
            }}
          >
            {clamp(title, 90)}
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.3, color: "rgba(226,232,240,0.86)", maxWidth: 980 }}>
            {clamp(subtitle, 140)}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                border: "1px solid rgba(34,211,238,0.25)",
                background: "rgba(2,6,23,0.35)",
                fontSize: 14,
                fontWeight: 800,
                color: "#e2e8f0",
              }}
            >
              US / UK / FR lens
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                border: "1px solid rgba(245,158,11,0.22)",
                background: "rgba(2,6,23,0.35)",
                fontSize: 14,
                fontWeight: 800,
                color: "#e2e8f0",
              }}
            >
              Implementation-first
            </div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(148,163,184,0.9)", fontWeight: 700 }}>aisignals.dev</div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}

