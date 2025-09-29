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
  return (
    <>
      <h1>{file.getTitle()}</h1>
      <Reference source={file.getAbsolutePath()} />
    </>
  );
}
