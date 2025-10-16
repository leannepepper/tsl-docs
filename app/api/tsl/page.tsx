import { Reference } from "renoun";
import { tslDir } from "@/app/lib/tsl-collections";

export default async function Page() {
  const file = await tslDir.getFile("TSL", "js");
  return (
    <>
      <h1>TSL.js Exports</h1>
      <Reference source={file} />
    </>
  );
}
