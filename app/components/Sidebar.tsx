import TreeNavigation, { NavItem } from "@/app/components/TreeNavigation";
import { tslCategories } from "@/app/lib/tsl-collections";
import { isDirectory, type Directory, type FileSystemEntry } from "renoun";

function getHref(entry: FileSystemEntry) {
  const relative = entry.getPathname({ includeBasePathname: false });
  const normalized = relative.startsWith("/") ? relative : `/${relative}`;
  if (normalized === "/") {
    return "/#docs";
  }
  return normalized;
}

async function getChildren(directory: Directory<any>): Promise<NavItem[]> {
  const entries = await directory.getEntries();
  const children = await Promise.all(
    entries.map(async (entry: FileSystemEntry) => {
      if (isDirectory(entry)) {
        const nestedChildren = await getChildren(entry);
        return {
          title: entry.title,
          href: getHref(entry),
          children: nestedChildren.length > 0 ? nestedChildren : undefined,
        };
      }
      return {
        title: entry.title,
        href: getHref(entry),
      };
    })
  );

  return children;
}

export default async function Sidebar() {
  const items: NavItem[] = await Promise.all(
    tslCategories.map(async (category) => {
      const entry = category.dir as FileSystemEntry;
      const children = isDirectory(entry)
        ? await getChildren(entry)
        : undefined;

      return {
        title: category.label,
        href: getHref(entry),
        children,
      };
    })
  );

  return <TreeNavigation items={items} />;
}
