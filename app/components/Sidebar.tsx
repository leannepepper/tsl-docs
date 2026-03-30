import type { FileSystemEntry, NavigationEntry } from "renoun";

import TreeNavigation, {
  type NavItem,
} from "@/app/components/TreeNavigation";
import { tslDir } from "@/app/lib/tsl-collections";

function getHref(entry: FileSystemEntry) {
  const relative = entry.getPathname({ includeBasePathname: false });
  const normalized = relative.startsWith("/") ? relative : `/${relative}`;

  if (normalized === "/") {
    return "/#docs";
  }

  return normalized;
}

function toNavItems(entries: NavigationEntry<FileSystemEntry>[]): NavItem[] {
  return entries.map(({ entry, children }) => ({
    title: entry.title,
    href: getHref(entry),
    children:
      children && children.length > 0 ? toNavItems(children) : undefined,
  }));
}

export default async function Sidebar() {
  const items = toNavItems(await tslDir.getTree());

  return <TreeNavigation items={items} />;
}
