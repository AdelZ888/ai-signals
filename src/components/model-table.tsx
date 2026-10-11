"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { fmtPct, fmtTokens, fmtUsd } from "@/lib/site/format";
import type { ModelRow } from "@/lib/site/rows";

type SortKey = "name" | "input" | "output" | "context" | "change30d";

export function ModelTable({
  rows, searchable = false, showLab = true, initialSort = "input",
}: { rows: ModelRow[]; searchable?: boolean; showLab?: boolean; initialSort?: SortKey | null }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey | null; dir: 1 | -1 }>({ key: initialSort, dir: 1 });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? rows.filter((r) => `${r.name} ${r.labName}`.toLowerCase().includes(q)) : rows;
    const key = sort.key;
    if (!key) return filtered;
    return [...filtered].sort((a, b) => {
      if (key === "name") return a.name.localeCompare(b.name) * sort.dir;
      const va = a[key];
      const vb = b[key];
      if (va === vb) return a.name.localeCompare(b.name);
      if (va === null) return 1;
      if (vb === null) return -1;
      return (va - vb) * sort.dir;
    });
  }, [rows, query, sort]);

  const th = (key: SortKey, label: string) => (
    <th scope="col" aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))}>
        {label}{sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );

  return (
    <>
      {searchable ? (
        <input className="search" type="search" aria-label="Search models" placeholder={`search ${rows.length} models… (e.g. "claude", "llama")`} value={query} onChange={(e) => setQuery(e.target.value)} />
      ) : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              {th("name", "model")}
              {showLab ? <th scope="col">lab</th> : null}
              {th("input", "in $/1M")}
              {th("output", "out $/1M")}
              {th("context", "ctx")}
              {th("change30d", "30d")}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={r.href}>{r.name}</Link>
                  {r.status !== "active" ? <> <span className="tag dim">{r.status}</span></> : null}
                </td>
                {showLab ? <td className="muted">{r.labName}</td> : null}
                <td>{fmtUsd(r.input)}</td>
                <td>{fmtUsd(r.output)}</td>
                <td>{fmtTokens(r.context)}</td>
                <td className={r.change30d === null ? "dim" : r.change30d < 0 ? "dn" : "up"}>{r.change30d === null ? "—" : fmtPct(r.change30d)}</td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr><td colSpan={showLab ? 6 : 5} className="dim">no model matches “{query}”</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
