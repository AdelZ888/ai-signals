import type { Model } from "../data/types.ts";
import { fmtUsd } from "./format.ts";
import { xmlEscape } from "./seo.ts";

const CHAR_WIDTH = 6.6; // monospace 11px
const PAD = 10;

export function badgeValue(m: Model): string {
  return `${m.name} · ${fmtUsd(m.price.input)} in / ${fmtUsd(m.price.output)} out per 1M`;
}

/** Shields-style SVG badge in the site's terminal colours. */
export function badgeSvg(label: string, value: string): string {
  const lw = Math.round(label.length * CHAR_WIDTH + PAD * 2);
  const vw = Math.round(value.length * CHAR_WIDTH + PAD * 2);
  const w = lw + vw;
  const font = 'font-family="DejaVu Sans Mono,Menlo,Consolas,monospace" font-size="11"';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${xmlEscape(`${label}: ${value}`)}">
<title>${xmlEscape(`${label}: ${value}`)}</title>
<rect width="${w}" height="20" rx="3" fill="#0a0e0b"/>
<rect x="${lw}" width="${vw}" height="20" rx="3" fill="#1d2a21"/>
<rect x="${lw}" width="4" height="20" fill="#1d2a21"/>
<text x="${lw / 2}" y="14" fill="#22c55e" text-anchor="middle" ${font}>${xmlEscape(label)}</text>
<text x="${lw + vw / 2}" y="14" fill="#e9fff1" text-anchor="middle" ${font}>${xmlEscape(value)}</text>
</svg>
`;
}
