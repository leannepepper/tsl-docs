import Link from "next/link";
import { Reference } from "renoun";
import {
  tslCategories,
  getDirForCategory,
  constantsPath,
} from "@/app/lib/tsl-collections";

export const dynamic = "error"; // ensure it's fully static

export async function generateStaticParams() {
  // one page per category (including "constants")
  return tslCategories.map((c) => ({ category: c.key }));
}

export default async function Page({
  params,
}: {
  params: { category: string };
}) {
  const category = params.category;

  if (category === "constants") {
    return (
      <>
        <h1>constants</h1>
        <Reference source={constantsPath} />
      </>
    );
  }

  const dir = getDirForCategory(category as any);
  if (!dir) return <p>Unknown category.</p>;

  const entries = await dir.getEntries();
  return (
    <>
      <h1>
        {tslCategories.find((c) => c.key === category)?.label ?? category}
      </h1>
      <ul>
        {entries.map((e) => (
          <li key={e.getPathname()}>
            <Link href={e.getPathname()}>{e.getTitle()}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
