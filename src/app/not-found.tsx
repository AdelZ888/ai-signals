import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "24px 0" }}>
      <p className="dim">$ curl -I {"<this page>"}</p>
      <h1>404: not found</h1>
      <p>
        This page does not exist. Try the <Link href="/models">model list</Link> or the <Link href="/calculator">cost calculator</Link>.
      </p>
    </div>
  );
}
