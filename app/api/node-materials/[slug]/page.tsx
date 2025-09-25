import { Reference } from "renoun";
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

export default async function Page({ params }: { params: { slug: string } }) {
  if (!materialsDir) {
    return <p>No NodeMaterials folder in this three build.</p>;
  }
  const file = await materialsDir.getFile(params.slug, "js");
  return (
    <>
      <h1>{file.getTitle()}</h1>
      <Reference source={file.getAbsolutePath()} />
    </>
  );
}
