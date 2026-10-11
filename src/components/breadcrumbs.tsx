import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { getSiteUrl } from "@/lib/site-url";

export function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  const base = getSiteUrl();
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        {items.map((it, i) => (
          <span key={it.href}>
            {i > 0 ? " / " : null}
            {i === items.length - 1 ? <span aria-current="page">{it.label}</span> : <Link href={it.href}>{it.label}</Link>}
          </span>
        ))}
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, item: `${base}${it.href}` })),
        }}
      />
    </>
  );
}
