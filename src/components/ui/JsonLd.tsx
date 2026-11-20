// Every page emits one connected graph; nodes link to each other by @id.
export default function JsonLd({ data }: { data: object | object[] }) {
  const nodes = (Array.isArray(data) ? data : [data]).map((node) => {
    const rest = { ...(node as Record<string, unknown>) };
    delete rest["@context"];
    return rest;
  });
  const graph = { "@context": "https://schema.org", "@graph": nodes };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />;
}
