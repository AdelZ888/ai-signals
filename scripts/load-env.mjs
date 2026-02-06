import fs from "node:fs";
import path from "node:path";

function parseDotEnv(raw) {
  const out = {};
  const lines = String(raw || "").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    // Remove surrounding quotes.
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key) out[key] = value;
  }

  return out;
}

function loadEnvFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = parseDotEnv(raw);

    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // ignore missing file
  }
}

// Load in roughly the same precedence order users expect locally.
const root = process.cwd();
loadEnvFile(path.join(root, ".env"));
loadEnvFile(path.join(root, ".env.local"));

