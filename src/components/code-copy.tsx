"use client";

import { useEffect } from "react";

import type { Locale } from "@/lib/i18n";

type CodeCopyEnhancerProps = {
  contentId: string;
  locale?: Locale;
};

async function copyText(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();
  document.execCommand("copy");

  textarea.remove();
}

export function CodeCopyEnhancer({ contentId, locale = "en" }: CodeCopyEnhancerProps) {
  useEffect(() => {
    const root = document.getElementById(contentId);
    if (!root) return;

    const copyLabel = locale === "fr" ? "Copier" : "Copy";
    const copiedLabel = locale === "fr" ? "Copié" : "Copied";
    const ariaLabel = locale === "fr" ? "Copier le code" : "Copy code";

    const pres = Array.from(root.querySelectorAll("pre"));

    for (const pre of pres) {
      if (!pre.parentElement) continue;
      if (pre.dataset.codeCopy === "1") continue;
      if (pre.closest(".code-toolbar")) continue;

      const code = pre.querySelector("code");
      if (!code) continue;

      pre.dataset.codeCopy = "1";

      const wrapper = document.createElement("div");
      wrapper.className = "code-toolbar";

      pre.parentElement.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy-btn";
      button.textContent = copyLabel;
      button.setAttribute("aria-label", ariaLabel);
      button.setAttribute("title", ariaLabel);

      let resetTimer: number | null = null;

      button.addEventListener("click", async (e) => {
        e.preventDefault();

        const text = String(code.textContent || "").replace(/\n$/, "");
        if (!text.trim()) return;

        try {
          await copyText(text);
          button.textContent = copiedLabel;
          button.dataset.copied = "1";

          if (resetTimer) window.clearTimeout(resetTimer);
          resetTimer = window.setTimeout(() => {
            button.textContent = copyLabel;
            button.dataset.copied = "0";
            resetTimer = null;
          }, 1500);
        } catch {
          // Ignore clipboard failure.
        }
      });

      wrapper.appendChild(button);
    }
  }, [contentId, locale]);

  return null;
}

