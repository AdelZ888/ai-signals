const PRICE_LINE = /^(input|output)\s*=\s*([0-9][0-9_]*(?:\.[0-9_]+)?)\s*(?:#.*)?$/u;

const toNumber = (s: string) => Number(s.replace(/_/gu, ""));

/** Minimal reader for the base input/output price of a models.dev TOML file. */
export function parseCostFromToml(text: string): { input: number; output: number } | null {
  const found: Partial<Record<"input" | "output", number>> = {};
  let section = "";
  for (const raw of text.split(/\r?\n/u)) {
    const line = raw.trim();
    if (line.startsWith("[")) {
      section = line.replace(/^\[+|\]+$/gu, "").trim();
      continue;
    }
    if (section === "cost") {
      const m = line.match(PRICE_LINE);
      if (m) found[m[1] as "input" | "output"] = toNumber(m[2]);
    } else if (section === "") {
      const inline = line.match(/^cost\s*=\s*\{(.*)\}\s*$/u);
      if (!inline) continue;
      for (const part of inline[1].split(",")) {
        const m = part.trim().match(PRICE_LINE);
        if (m) found[m[1] as "input" | "output"] = toNumber(m[2]);
      }
    }
  }
  return typeof found.input === "number" && typeof found.output === "number" ? { input: found.input, output: found.output } : null;
}
