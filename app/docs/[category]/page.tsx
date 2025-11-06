import { tslCategories } from "@/app/lib/tsl-collections";

export const dynamic = "error"; // disallow runtime rendering
export const revalidate = false; // not ISR
export const dynamicParams = false; // only the params you return below

// export async function generateStaticParams() {
//   return tslCategories.map((c) => ({ category: c.key }));
// }

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  return (
    <>
      <h1>Category Page</h1>
    </>
  );
}
