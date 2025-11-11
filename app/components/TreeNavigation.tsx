"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type NavItem = {
  title: string;
  href?: string;
  children?: NavItem[];
};

function normalizePathname(path: string) {
  if (path === "/") return path;
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function pathMatches(item: NavItem, currentPath: string): boolean {
  if (item.href) {
    const normalizedHref = normalizePathname(item.href);
    const normalizedPath = normalizePathname(currentPath);
    if (
      normalizedPath === normalizedHref ||
      normalizedPath.startsWith(`${normalizedHref}/`)
    ) {
      return true;
    }
  }

  if (item.children?.length) {
    return item.children.some((child) => pathMatches(child, currentPath));
  }

  return false;
}

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
  const normalizedPath = normalizePathname(currentPath);
  const normalizedHref = item.href ? normalizePathname(item.href) : "";
  const isActive = !!item.href && normalizedPath === normalizedHref;
  const shouldBeOpen = hasChildren && pathMatches(item, currentPath);
  const [open, setOpen] = useState(shouldBeOpen);

  useEffect(() => {
    if (shouldBeOpen) {
      setOpen(true);
    }
  }, [shouldBeOpen]);

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
