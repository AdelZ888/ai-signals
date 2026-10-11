import Link from "next/link";

const LINKS = [
  ["/models", "models"], ["/compare", "compare"], ["/best", "best"],
  ["/calculator", "calculator"], ["/changes", "changes"], ["/news", "news"],
] as const;

export function TerminalNav() {
  return (
    <header className="shell">
      <nav className="nav" aria-label="Main">
        <Link href="/" className="nav-logo">&gt; ai_signals<span className="cursor">_</span></Link>
        <div className="nav-links">
          {LINKS.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </div>
      </nav>
    </header>
  );
}
