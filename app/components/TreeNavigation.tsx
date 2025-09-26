"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

export type NavItem = {
  title: string;
  href?: string;
  children?: NavItem[];
};

function Item({
  item,
  depth,
  currentPath,
}: {
  item: NavItem;
  depth: number;
  currentPath: string;
}) {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const isActive = !!item.href && currentPath === item.href;
  const [open, setOpen] = useState(true);

  if (hasChildren) {
    return (
      <li>
        <button
          type="button"
          className="tree-nav__group"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {item.title}
        </button>
        {open && (
          <ul className="tree-nav__list">
            {item.children!.map((child) => (
              <Item
                key={(child.href ?? child.title) + depth}
                item={child}
                depth={depth + 1}
                currentPath={currentPath}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      {item.href ? (
        <Link
          href={item.href}
          className={isActive ? "tree-nav__link is-active" : "tree-nav__link"}
        >
          {item.title}
        </Link>
      ) : (
        <span className="tree-nav__label">{item.title}</span>
      )}
    </li>
  );
}

export default function TreeNavigation({ items }: { items: NavItem[] }) {
  const pathname = usePathname() || "/";
  const normalized = useMemo(() => items, [items]);

  return (
    <nav>
      <ul className="tree-nav__list">
        {normalized.map((i, idx) => (
          <Item
            key={(i.href ?? i.title) + idx}
            item={i}
            depth={0}
            currentPath={pathname}
          />
        ))}
      </ul>
    </nav>
  );
}
