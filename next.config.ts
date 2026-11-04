import type { NextConfig } from "next";

/** Retracted on 2026-11-04: these reported an upstream SKU mix-up, not real price changes. */
const RETRACTED_NEWS: Record<string, string> = {
  "2026-10-23-muse-spark-1-2-price-cut": "/models/meta/muse-spark-1.2",
  "2026-10-24-kimi-k2-7-code-price-cut": "/models/moonshotai/kimi-k2.7-code",
  "2026-10-29-muse-spark-1-3-price-increase": "/models/meta/muse-spark-1.3",
  "2026-10-31-muse-spark-1-3-price-cut": "/models/meta/muse-spark-1.3",
};

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return Object.entries(RETRACTED_NEWS).map(([slug, destination]) => ({ source: `/news/${slug}`, destination, permanent: true }));
  },
};

export default nextConfig;
