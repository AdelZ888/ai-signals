"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";

import { track, useSearchTracking } from "@/components/analytics";

import { monthlyCost, parseTokenInput } from "@/lib/site/cost";
import { fmtUsd, fmtUsdCost } from "@/lib/site/format";

export type CalcRow = { id: string; name: string; href: string; input: number; output: number };

export function CostCalculator({
  rows, defaultInputM = 50, defaultOutputM = 10, searchable = false,
}: { rows: CalcRow[]; defaultInputM?: number; defaultOutputM?: number; searchable?: boolean }) {
  const id = useId();
  const [inputM, setInputM] = useState(String(defaultInputM));
  const [outputM, setOutputM] = useState(String(defaultOutputM));
  const [query, setQuery] = useState("");
  const [edited, setEdited] = useState(false);
  useSearchTracking(query, "calculator");
  const inTokens = parseTokenInput(inputM) * 1_000_000;
  const outTokens = parseTokenInput(outputM) * 1_000_000;

  useEffect(() => {
    if (!edited) return;
    const timer = window.setTimeout(() => track("calculator_use", { input_m: inTokens / 1_000_000, output_m: outTokens / 1_000_000 }), 2000);
    return () => window.clearTimeout(timer);
  }, [edited, inTokens, outTokens]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => !q || r.name.toLowerCase().includes(q))
      .map((r) => ({ ...r, cost: monthlyCost(r, inTokens, outTokens) }))
      .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
  }, [rows, query, inTokens, outTokens]);

  return (
    <div>
      <div className="calc-inputs">
        <div>
          <label htmlFor={`${id}-in`}>input tokens / month (millions)</label>
          <input id={`${id}-in`} className="input" inputMode="decimal" value={inputM} onChange={(e) => { setInputM(e.target.value); setEdited(true); }} />
        </div>
        <div>
          <label htmlFor={`${id}-out`}>output tokens / month (millions)</label>
          <input id={`${id}-out`} className="input" inputMode="decimal" value={outputM} onChange={(e) => { setOutputM(e.target.value); setEdited(true); }} />
        </div>
      </div>
      {searchable ? (
        <input className="search" style={{ marginTop: 12 }} placeholder="filter models…" aria-label="Filter models" value={query} onChange={(e) => setQuery(e.target.value)} />
      ) : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr><th scope="col">model</th><th scope="col">in $/1M</th><th scope="col">out $/1M</th><th scope="col">= monthly</th></tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td><Link href={r.href}>{r.name}</Link></td>
                <td>{fmtUsd(r.input)}</td>
                <td>{fmtUsd(r.output)}</td>
                <td className="dn">{fmtUsdCost(r.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="dim">Base-tier list prices. Long-context tiers, caching and batch discounts are not included.</p>
    </div>
  );
}
