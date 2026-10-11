/** Escapes Markdown/HTML metacharacters in untrusted text (model names come from a third-party dataset). */
export function mdEscape(text: string): string {
  return text.replace(/\s*[\r\n]+\s*/gu, " ").replace(/[\\`*_[\]()|<>]/gu, (c) => `\\${c}`);
}
