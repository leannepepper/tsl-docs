import OnThisPage from "@/app/components/OnThisPage";
import type { ReactNode } from "react";
import { tslCategories } from "../lib/tsl-collections";

export async function generateStaticParams() {
  // one page per category (including "constants")
  return tslCategories.map((c) => ({ category: c.key }));
}

export default async function APILayout(props: any) {
  const { children } = props;
  return <> {children} </>;
}
