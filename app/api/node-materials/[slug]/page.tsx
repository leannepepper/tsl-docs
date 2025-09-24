import { Reference } from "renoun";
import { materialsDir } from "@/app/api/lib/tsl-collections";

export default async function Page({ params }: { params: { slug: string } }) {
  const file = await materialsDir.getFile(params.slug, "js");
  return (
    <>
      <h1>{file.getTitle()}</h1>
      <Reference source={file.getAbsolutePath()} />
    </>
  );
}
