import { put } from "@vercel/blob";

const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-3-pro-image-preview";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clampText(input, maxChars) {
  const value = String(input || "").trim();
  if (value.length <= maxChars) return value;
  return value.slice(0, Math.max(0, maxChars - 1)).trimEnd() + "…";
}

function normalizeTagList(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => String(tag || "").trim())
    .filter(Boolean)
    .slice(0, 8);
}

function buildCoverPrompt({ title, excerpt, tags, category, region }) {
  // Goal: consistent, on-brand hero images that fit the blog's dark cyan/amber aesthetic.
  // Keep the prompt short and stable: generative models can become unpredictable with long constraints.
  const safeTitle = clampText(title, 90);
  const safeExcerpt = clampText(excerpt, 160);
  const tagLine = normalizeTagList(tags).join(", ");
  const safeCategory = clampText(category || "", 42);
  const safeRegion = clampText(region || "", 18);

  return [
    "Create a modern editorial hero image for a tech blog called AI Signals.",
    "Style: dark, minimal, high-contrast, clean, premium. Subtle grid texture, soft film grain.",
    "Palette: deep navy/near-black background with cyan (#22d3ee) + warm amber (#f59e0b) glow accents.",
    "Subject: abstract, symbolic illustration of the article topic (AI systems, agents, models, tooling).",
    "Composition: strong focal area, generous negative space, no busy clutter, no faces, no people, no logos.",
    "Important: NO TEXT, NO WORDS, NO LETTERING, NO WATERMARKS.",
    "Lighting: soft volumetric glow, crisp edges, slight depth, tasteful noise.",
    `Context: category=${safeCategory || "AI"}, region=${safeRegion || "GLOBAL"}, tags=[${tagLine || "AI"}].`,
    `Article title: ${safeTitle}`,
    safeExcerpt ? `Article excerpt: ${safeExcerpt}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function extractInlineImage(parts) {
  if (!Array.isArray(parts)) return null;

  for (const part of parts) {
    const inline = part?.inlineData || part?.inline_data || part?.inline || null;
    const data = inline?.data || inline?.bytes || null;
    const mimeType = inline?.mimeType || inline?.mime_type || null;
    if (typeof data === "string" && data.trim().length > 0) {
      return { data, mimeType: typeof mimeType === "string" ? mimeType : null };
    }
  }

  return null;
}

export async function generateCoverImageBuffer({
  title,
  excerpt,
  tags,
  category,
  region,
  model = process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL,
  apiKey = process.env.GEMINI_API_KEY,
  imageSize = "1K",
  aspectRatio = "16:9",
}) {
  const key = String(apiKey || "").trim();
  if (!key) throw new Error("Missing GEMINI_API_KEY");

  const prompt = buildCoverPrompt({ title, excerpt, tags, category, region });
  const url = `${GEMINI_API_ENDPOINT}/models/${encodeURIComponent(model)}:generateContent`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      // Explicitly request only images to avoid accidental text outputs in `parts`.
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio,
        imageSize,
      },
    },
  };

  let lastErr;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = json?.error?.message ? String(json.error.message) : `HTTP ${res.status}`;
        const err = new Error(`[gemini] ${message}`);
        err.cause = json;
        throw err;
      }

      const parts = json?.candidates?.[0]?.content?.parts || [];
      const inline = extractInlineImage(parts);
      if (!inline) {
        const err = new Error("[gemini] No inline image data returned");
        err.cause = json;
        throw err;
      }

      const mimeType = inline.mimeType || "image/png";
      const buffer = Buffer.from(inline.data, "base64");
      if (!buffer?.length) throw new Error("[gemini] Empty image buffer");

      return { buffer, mimeType, prompt };
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        await sleep(800 * attempt);
        continue;
      }
    }
  }

  throw lastErr || new Error("Gemini image generation failed");
}

function extensionForMimeType(mimeType) {
  const mt = String(mimeType || "").toLowerCase();
  if (mt.includes("png")) return "png";
  if (mt.includes("jpeg") || mt.includes("jpg")) return "jpg";
  if (mt.includes("webp")) return "webp";
  return "png";
}

export async function uploadCoverToBlob({
  slug,
  buffer,
  mimeType,
  force = false,
}) {
  const safeSlug = String(slug || "").trim();
  if (!safeSlug) throw new Error("Missing slug for cover upload");

  const ext = extensionForMimeType(mimeType);
  const pathname = `covers/${safeSlug}.${ext}`;

  const result = await put(pathname, buffer, {
    access: "public",
    contentType: mimeType,
    addRandomSuffix: false,
    allowOverwrite: force,
    cacheControlMaxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { url: result.url, pathname: result.pathname, contentType: result.contentType };
}

export async function generateAndUploadCover({
  slug,
  title,
  excerpt,
  tags,
  category,
  region,
  force = false,
}) {
  const enabled = String(process.env.IMAGES_ENABLED ?? "1") !== "0";
  if (!enabled) return null;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Best-effort: do not block publishing if Blob isn't configured.
    console.warn("[cover-images] Missing BLOB_READ_WRITE_TOKEN; skipping cover generation.");
    return null;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("[cover-images] Missing GEMINI_API_KEY; skipping cover generation.");
    return null;
  }

  try {
    const { buffer, mimeType } = await generateCoverImageBuffer({ title, excerpt, tags, category, region });
    const uploaded = await uploadCoverToBlob({ slug, buffer, mimeType, force });
    return uploaded.url;
  } catch (err) {
    console.warn("[cover-images] Failed to generate cover image; continuing without it.", err?.message || err);
    return null;
  }
}

