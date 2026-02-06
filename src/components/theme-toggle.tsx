"use client";

type Theme = "light" | "dark";

function readThemeFromDom(): Theme {
  if (typeof document === "undefined") return "dark";
  const current = document.documentElement.getAttribute("data-theme");
  return current === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.remove("theme-light", "theme-dark");
  root.classList.add(theme === "light" ? "theme-light" : "theme-dark");

  if (document.body) {
    document.body.setAttribute("data-theme", theme);
  }

  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Ignore storage failures and still apply theme for this session.
  }
}

export function ThemeToggle() {
  function toggleTheme() {
    const current = readThemeFromDom();
    const nextTheme: Theme = current === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      Theme
    </button>
  );
}
