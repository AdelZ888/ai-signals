import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell" style={{ padding: "40px 16px" }}>
      <p className="dim">$ curl -I {"<this page>"}</p>
      <h1>404: not found</h1>
      <p>
        This page does not exist. Try the <Link href="/models">model list</Link> or the <Link href="/calculator">cost calculator</Link>.
      </p>
    </main>
  );
}
