import Link from "next/link";
import { materialsDir } from "@/app/api/lib/tsl-collections";

export default async function Page() {
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
