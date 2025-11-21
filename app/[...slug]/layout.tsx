import { DocsShell } from "../components/DocsShell";
import { tslCategories } from "../lib/tsl-collections";

export async function generateStaticParams() {
  return tslCategories.map((c) => ({ category: c.key }));
}

export default async function APILayout(props: any) {
  const { children } = props;
  return <DocsShell>{children}</DocsShell>;
}
