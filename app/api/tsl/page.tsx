import { Reference } from "renoun";
import { getTslRootFile } from "@/app/lib/tsl-collections";

export default async function Page() {
  const file = await getTslRootFile();
  return (
    <>
      <h1>TSL.js Exports</h1>
      <Reference source={file} />
    </>
  );
}
