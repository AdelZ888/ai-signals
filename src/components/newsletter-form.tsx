"use client";

import { useId, useState } from "react";

import { track } from "@/components/analytics";

type State = "idle" | "sending" | "done" | "error";

export function NewsletterForm({ source = "footer" }: { source?: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [state, setState] = useState<State>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, locale: "en", hp, utm_source: "site", utm_medium: source }),
      });
      setState(res.ok ? "done" : "error");
      if (res.ok) track("sign_up", { method: "newsletter", signup_source: source });
    } catch {
      setState("error");
    }
  }

  if (state === "done") return <p className="ok">✓ subscribed. Check your inbox.</p>;
  return (
    <form className="newsletter-form" onSubmit={onSubmit}>
      <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
      <input id={`${id}-email`} className="search" type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" value={hp} onChange={(e) => setHp(e.target.value)} />
      <button type="submit" className="btn" disabled={state === "sending"}>{state === "sending" ? "..." : "subscribe"}</button>
      {state === "error" ? <p className="up">Something went wrong. Please try again.</p> : null}
    </form>
  );
}
