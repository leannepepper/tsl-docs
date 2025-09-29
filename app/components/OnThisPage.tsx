"use client";

import { useEffect, useMemo, useState } from "react";
import { TableOfContents } from "renoun";

type TocScanItem = {
  id: string;
  text: string;
  level: number; // 2,3,4
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function OnThisPage() {
  const [items, setItems] = useState<TocScanItem[]>([]);

  useEffect(() => {
    const container = document.querySelector(".docs-content");
    if (!container) return;

    let headings = Array.from(
      container.querySelectorAll<HTMLHeadingElement>("h3")
    );
    if (headings.length === 0) {
      headings = Array.from(
        container.querySelectorAll<HTMLHeadingElement>("h2, h3, h4")
      );
    }

    const collected: TocScanItem[] = headings.map((el) => {
      if (!el.id) {
        el.id = slugify(el.textContent || "");
      }
      const level = Number(el.tagName.substring(1));
      return { id: el.id, text: el.textContent || "", level };
    });

    setItems(collected);
  }, []);

  const hasItems = items.length > 0;
  const headingsProp = useMemo(
    () => items.map((i) => ({ id: i.id, title: i.text, level: i.level })),
    [items]
  );

  return (
    <>
      <h2>On this page</h2>
    </>
  );
}
