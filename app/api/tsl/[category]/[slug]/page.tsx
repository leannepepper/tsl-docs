import { Reference } from "renoun";
import {
  tslCategories,
  getDirForCategory,
} from "@/app/api/lib/tsl-collections";

export const dynamic = "error";

export async function generateStaticParams() {
  const all: { category: string; slug: string }[] = [];

  for (const c of tslCategories) {
    // only categories that have files (skip "constants")
    const dir = "dir" in c && c.dir ? c.dir : null;
    if (!dir) continue;

    const entries = await dir.getEntries();
    for (const e of entries) {
      // the last segment of getPathname() is the slug (already kebab-cased)
      const parts = e.getPathname().split("/");
      const slug = parts[parts.length - 1];
      all.push({ category: c.key, slug });
    }
  }

  return all;
}

export default async function Page({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const dir = getDirForCategory(params.category as any);
  if (!dir) return <p>Unknown category.</p>;

  const file = await dir.getFile(params.slug, "js");
  return (
    <>
      <h1>{file.getTitle()}</h1>
      <Reference source={file.getAbsolutePath()} />
    </>
  );
}
