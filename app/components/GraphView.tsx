"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type GraphNode = {
  id: string;
  title: string;
  href: string;
  category: string;
};

export type GraphEdge = { from: string; to: string };

export default function GraphView({
  nodes,
  edges,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 640, height: 640 });

  // --- Categories and degrees
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const n of nodes) set.add(n.category || "misc");
    return [...set].sort();
  }, [nodes]);

  const degree = useMemo(() => {
    const d: Record<string, { in: number; out: number }> = {};
    for (const n of nodes) d[n.id] = { in: 0, out: 0 };
    for (const e of edges) {
      if (!d[e.from]) d[e.from] = { in: 0, out: 0 };
      if (!d[e.to]) d[e.to] = { in: 0, out: 0 };
      d[e.from].out += 1;
      d[e.to].in += 1;
    }
    return d;
  }, [nodes, edges]);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const counts: Record<string, number> = {};
    for (const n of nodes) counts[n.category] = (counts[n.category] || 0) + 1;
    const obj: Record<string, boolean> = {};
    for (const c of Object.keys(counts)) obj[c] = counts[c] > 20; // collapse large groups
    return obj;
  });

  const palette = useMemo(() => {
    const colors = [
      "#87b0ff",
      "#ff9f9f",
      "#a1f0b7",
      "#f6d365",
      "#c7a0ff",
      "#78e7e7",
      "#f4a6ff",
    ];
    const map: Record<string, string> = {};
    categories.forEach((c, i) => (map[c] = colors[i % colors.length]));
    return map;
  }, [categories]);

  useEffect(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;
    const resize = () => {
      const rect = element.getBoundingClientRect();
      const vw = typeof window !== "undefined" ? window.innerHeight : 640;
      // Width follows container width; height follows viewport to avoid feedback loops
      const width = Math.max(320, Math.floor(rect.width || 640));
      const height = Math.max(360, Math.min(900, Math.floor(vw - 120)));
      setSize({ width, height });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => {
    const width = size.width;
    const height = Math.max(320, size.height - 40);
    const margin = { top: 32, right: 48, bottom: 32, left: 48 } as const;
    const innerW = Math.max(200, width - margin.left - margin.right);
    const innerH = Math.max(200, height - margin.top - margin.bottom);

    const nodePositions = new Map<string, { x: number; y: number }>();

    type VisibleNode = GraphNode & { isGroup?: boolean; group?: string };
    const visibleNodes: VisibleNode[] = [];

    // Determine visible nodes per category (collapsed => 1 group node)
    for (const c of categories) {
      if (collapsed[c]) {
        visibleNodes.push({
          id: `group:${c}`,
          title: c,
          href: `/docs/tsl/${c}`,
          category: c,
          isGroup: true,
          group: c,
        });
      } else {
        nodes
          .filter((n) => n.category === c)
          .forEach((n) => visibleNodes.push(n));
      }
    }

    // Column layout by category
    const colCount = Math.max(1, categories.length);
    const colWidth = innerW / colCount;

    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      const columnX = margin.left + i * colWidth + colWidth / 2;
      const list = visibleNodes.filter((n) => n.category === c);
      // Sort: group first, then by importance
      list.sort((a, b) => {
        const groupRank = (b.isGroup ? 1 : 0) - (a.isGroup ? 1 : 0);
        if (groupRank !== 0) return groupRank;
        return (degree[b.id]?.in || 0) - (degree[a.id]?.in || 0);
      });
      const rows = Math.max(1, list.length);
      const gap = Math.min(40, innerH / rows);
      const startY = margin.top + 16;
      list.forEach((node, idx) => {
        const y = startY + idx * gap;
        nodePositions.set(node.id, { x: columnX, y });
      });
    }

    return { nodePositions, width, height, visibleNodes };
  }, [nodes, categories, collapsed, degree, size.width, size.height]);

  const strokeColor = "rgba(255,255,255,0.15)";
  const nodeStroke = "rgba(255,255,255,0.35)";

  // Build visible edges (aggregate when categories are collapsed)
  const { visibleNodes, nodePositions } = layout as unknown as {
    visibleNodes: (GraphNode & { isGroup?: boolean; group?: string })[];
    nodePositions: Map<string, { x: number; y: number }>;
  };

  const visibleEdges = useMemo(() => {
    const mapId = (id: string) => {
      const n = nodes.find((x) => x.id === id);
      if (!n) return id;
      return collapsed[n.category] ? `group:${n.category}` : id;
    };
    const agg = new Map<string, number>();
    for (const e of edges) {
      const a = mapId(e.from);
      const b = mapId(e.to);
      if (a === b) continue;
      const key = `${a}->${b}`;
      agg.set(key, (agg.get(key) || 0) + 1);
    }
    return [...agg.entries()].map(([k, count]) => {
      const [from, to] = k.split("->");
      return { from, to, count } as { from: string; to: string; count: number };
    });
  }, [edges, nodes, collapsed]);

  const maxIn = useMemo(
    () => Math.max(1, ...nodes.map((n) => degree[n.id]?.in || 0)),
    [nodes, degree]
  );

  return (
    <div ref={containerRef} style={{ width: "100%", minHeight: 520 }}>
      {/* Legend / controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: "6px 8px",
        }}
      >
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCollapsed((s) => ({ ...s, [c]: !s[c] }))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.15)",
              background: collapsed[c] ? "#111" : "#1a1a1a",
              color: "#ddd",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                background: palette[c],
                borderRadius: 2,
              }}
            />
            <span style={{ fontSize: 12 }}>{c}</span>
            <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 6 }}>
              {collapsed[c] ? "collapsed" : "expanded"}
            </span>
          </button>
        ))}
      </div>
      <svg
        width={size.width}
        height={size.height - 40}
        style={{ display: "block" }}
      >
        {/* Edges */}
        <g>
          {visibleEdges.map((edge, idx) => {
            const a = nodePositions.get(edge.from);
            const b = nodePositions.get(edge.to);
            if (!a || !b) return null;
            const dx = Math.max(40, Math.abs(b.x - a.x) * 0.4);
            const path = `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${
              b.y
            }, ${b.x} ${b.y}`;
            return (
              <path
                key={`${edge.from}->${edge.to}-${idx}`}
                d={path}
                fill="none"
                stroke={strokeColor}
                strokeWidth={Math.min(
                  2.5,
                  0.6 + Math.log(1 + edge.count) * 0.7
                )}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {visibleNodes.map((node) => {
            const p = nodePositions.get(node.id);
            if (!p) return null;
            const inDeg = degree[node.id]?.in || 0;
            const r = node.isGroup ? 12 : Math.max(5, 5 + (inDeg / maxIn) * 9);
            const nodeFill = palette[node.category] || "#333";
            const showLabel = node.isGroup || r >= 9;
            return (
              <a key={node.id} href={node.href} target="_self">
                <g>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={r}
                    fill={nodeFill}
                    stroke={nodeStroke}
                  />
                  {showLabel && (
                    <text
                      x={p.x + r + 4}
                      y={p.y + 4}
                      style={{ fontSize: node.isGroup ? 12 : 11, fill: "#ddd" }}
                    >
                      {node.title}
                    </text>
                  )}
                </g>
              </a>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
