import Link from "next/link";
import { materialsDir } from "@/app/lib/tsl-collections";

export const dynamic = "error";

export default async function Page() {
  if (!materialsDir) {
    return (
      <>
        <h1>NodeMaterials</h1>
        <p>
          No NodeMaterials found. This three version doesn’t include{" "}
          <code>src/nodes/materials</code>.
        </p>
      </>
    );
  }

  const entries = await materialsDir.getEntries();
  return (
    <>
      <h1>NodeMaterials</h1>
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
