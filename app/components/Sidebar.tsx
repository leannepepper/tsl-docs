import Link from "next/link";
import {
  materialsDir,
  tslCategories,
  getDirForCategory,
} from "@/app/api/lib/tsl-collections";

async function list(dir: any) {
  return dir.getEntries();
}

export default async function Sidebar() {
  const materials = await materialsDir.getEntries();

  return (
    <nav>
      <h3>API</h3>

      <ul>
        <li>
          <strong>NodeMaterials</strong>
          <ul>
            {materials.map((e) => (
              <li key={e.getPathname()}>
                <Link href={e.getPathname()}>{e.getTitle()}</Link>
              </li>
            ))}
          </ul>
        </li>

        <li>
          <strong>TSL (nodes)</strong>
          <ul>
            {/* constants is a single page */}
            <li>
              <Link href="/api/tsl/constants">constants</Link>
            </li>

            {/* the rest mirror the repo order */}
            {await Promise.all(
              tslCategories
                .filter((c) => c.key !== "constants")
                .map(async (c) => {
                  const dir = getDirForCategory(c.key as any);
                  const entries = dir ? await list(dir) : [];
                  return (
                    <li key={c.key}>
                      <strong>
                        <Link href={`/api/tsl/${c.key}`}>{c.label}</Link>
                      </strong>
                      <ul>
                        {entries.map((e: any) => (
                          <li key={e.getPathname()}>
                            <Link href={e.getPathname()}>{e.getTitle()}</Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })
            )}
          </ul>
        </li>

        <li>
          <strong>
            <Link href="/api/tsl">TSL.js Exports</Link>
          </strong>
        </li>
      </ul>
    </nav>
  );
}
