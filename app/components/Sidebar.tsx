import TreeNavigation, { NavItem } from "@/app/components/TreeNavigation";
import {
  materialsDir,
  tslCategories,
  getDirForCategory,
} from "@/app/lib/tsl-collections";

async function list(dir: any) {
  return dir.getEntries();
}

export default async function Sidebar() {
  const materials = await materialsDir.getEntries();

  const items: NavItem[] = [
    {
      title: "API",
      children: [
        {
          title: "NodeMaterials",
          children: materials.map((e: any) => ({
            title: e.getTitle(),
            href: e.getPathname(),
          })),
        },
        {
          title: "TSL (nodes)",
          children: [
            { title: "constants", href: "/docs/tsl/constants" },
            ...(await Promise.all(
              tslCategories
                .filter((c) => c.key !== "constants")
                .map(async (c) => {
                  const dir = getDirForCategory(c.key as any);
                  const entries = dir ? await list(dir) : [];
                  return {
                    title: c.label,
                    href: `/docs/tsl/${c.key}`,
                    children: entries.map((e: any) => ({
                      title: e.getTitle(),
                      href: e.getPathname(),
                    })),
                  } as NavItem;
                })
            )),
          ],
        },
        { title: "TSL.js Exports", href: "/docs/tsl" },
      ],
    },
  ];

  return <TreeNavigation items={items} />;
}
