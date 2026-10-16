import type { Metadata } from "next";

import { Box } from "@/components/box";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { NewsletterForm } from "@/components/newsletter-form";
import { alternatesFor } from "@/lib/site/seo";

export const metadata: Metadata = {
  title: "Weekly AI Model Pricing Digest",
  description: "One email every Monday: new AI models, price cuts, price increases and deprecations, straight from our daily data.",
  alternates: alternatesFor("/newsletter"),
};

export default function NewsletterPage() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/newsletter", label: "newsletter" }]} />
      <h1>The weekly AI pricing digest</h1>
      <div className="prose">
        <p>Every Monday you get one short email with what changed in AI model pricing last week:</p>
        <ul>
          <li>new models and their launch prices,</li>
          <li>price cuts and increases, with the percentage,</li>
          <li>context window changes and deprecations.</li>
        </ul>
        <p>No fluff, no sponsored picks. Unsubscribe in one click.</p>
      </div>
      <Box title="subscribe">
        <NewsletterForm source="newsletter-page" />
      </Box>
    </>
  );
}
