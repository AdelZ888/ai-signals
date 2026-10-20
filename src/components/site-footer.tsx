import Link from "next/link";

import { ConsentSettingsLink } from "@/components/consent-banner";
import { NewsletterForm } from "@/components/newsletter-form";

export function SiteFooter() {
  return (
    <footer className="shell footer">
      <div className="footer-grid">
        <div>
          <p className="box-title">{"// weekly digest"}</p>
          <p>Price cuts, new models and deprecations, every Monday.</p>
          <NewsletterForm />
        </div>
        <div>
          <p className="box-title">{"// explore"}</p>
          <p>
            <Link href="/models">all models</Link><br />
            <Link href="/providers">providers</Link><br />
            <Link href="/hosts">inference hosts</Link><br />
            <Link href="/compare">comparisons</Link><br />
            <Link href="/best">rankings</Link><br />
            <Link href="/calculator">cost calculator</Link><br />
            <Link href="/changes">changelog</Link><br />
            <Link href="/guides">pricing guides</Link>
          </p>
        </div>
        <div>
          <p className="box-title">{"// about"}</p>
          <p>
            <Link href="/about">methodology &amp; sources</Link><br />
            <a href="/rss.xml">rss</a> · <a href="/data/models.json">json</a> · <a href="/data/models.csv">csv</a><br />
            Data: <a href="https://models.dev" rel="noopener">models.dev</a> (MIT)<br />
            <ConsentSettingsLink />
          </p>
        </div>
      </div>
      <p className="dim">AI Signals. List prices in USD per 1M tokens. Always confirm with the provider before you commit.</p>
    </footer>
  );
}
