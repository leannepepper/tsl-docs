import { Reference } from "renoun";
import { tslRootPath } from "@/app/lib/tsl-collections";

export default function Page() {
  return (
    <>
      <h1>TSL.js Exports</h1>
      <Reference source={tslRootPath} />
    </>
  );
}
