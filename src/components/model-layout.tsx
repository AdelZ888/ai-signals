"use client";

import { useSyncExternalStore } from "react";

type Layout = "dashboard" | "report";
const KEY = "ais-layout";
const listeners = new Set<() => void>();

function read(): Layout {
  try {
    return window.localStorage.getItem(KEY) === "report" ? "report" : "dashboard";
  } catch {
    return "dashboard";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function write(layout: Layout) {
  try {
    window.localStorage.setItem(KEY, layout);
  } catch {
    /* storage unavailable: the choice lasts for this page view */
  }
  listeners.forEach((l) => l());
}

/** Same HTML for both layouts; CSS switches the grid. Mobile is always the report layout. */
export function ModelLayout({ main, side }: { main: React.ReactNode; side: React.ReactNode }) {
  const layout = useSyncExternalStore(subscribe, read, () => "dashboard" as Layout);
  return (
    <div className="model-layout" data-layout={layout}>
      <div className="layout-toggle" role="group" aria-label="Page layout">
        <button type="button" aria-pressed={layout === "dashboard"} onClick={() => write("dashboard")}>dashboard</button>
        <button type="button" aria-pressed={layout === "report"} onClick={() => write("report")}>report</button>
      </div>
      <div className="model-main">{main}</div>
      <div className="model-side">{side}</div>
    </div>
  );
}
