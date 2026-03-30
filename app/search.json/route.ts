import { NextResponse } from "next/server";

import { getSearchResults } from "@/app/lib/search-results";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  const results = await getSearchResults();

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
