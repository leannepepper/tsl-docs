import { Headings, Reference } from "renoun";
import { OnThisPage } from "@/app/components/OnThisPage";
import { materialsDir } from "@/app/lib/tsl-collections";

export const dynamic = "error";

export async function generateStaticParams() {
  if (!materialsDir) return [];
  const entries = await materialsDir.getEntries();
  return entries.map((e) => {
    const parts = e.getPathname().split("/");
    return { slug: parts[parts.length - 1] };
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!materialsDir) {
    return <p>No NodeMaterials folder in this three build.</p>;
  }
  const file = await materialsDir.getFile(slug, "js");
  const exports = await file.getExports();
  const headings: Headings = exports.map((exp) => ({
    id: exp.getSlug(),
    text: exp.getTitle(),
    level: 3,
  }));
  return (
    <>
      <main className="docs-content">
        <h1>{file.getTitle()}</h1>
        <Reference source={file as any} />
      </main>
      <aside className="docs-toc">
        <OnThisPage headings={headings} entry={file} />
      </aside>
    </>
  );
}
