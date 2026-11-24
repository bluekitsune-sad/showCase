import { serializeJsonLd } from "@/lib/seo";

type JsonLdNode = Record<string, unknown>;

export function StructuredData({ nodes }: { nodes: JsonLdNode | JsonLdNode[] }) {
  const payload = Array.isArray(nodes)
    ? { "@context": "https://schema.org", "@graph": nodes }
    : { "@context": "https://schema.org", ...nodes };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(payload) }}
    />
  );
}
