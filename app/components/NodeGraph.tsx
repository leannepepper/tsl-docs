import path from "node:path";
import React from "react";
import { Directory, isFile, isJavaScriptFile } from "renoun";
import { tslDir } from "@/app/lib/tsl-collections";
import GraphView from "./GraphView";

type GraphNode = {
  id: string; // src/nodes/.../file.js
  title: string;
  href: string;
  category: string;
};

type GraphEdge = { from: string; to: string };

function parseImportSpecifiers(source: string): string[] {
  const results: string[] = [];
  // import ... from 'x'
  const importFromRE = /from\s+["']([^"']+)["']/g;
  // bare import: import 'x'
  const bareImportRE = /import\s+["']([^"']+)["']/g;
  // export ... from 'x'
  const exportFromRE = /export\s+[^;]*?from\s+["']([^"']+)["']/g;

  for (const re of [importFromRE, bareImportRE, exportFromRE]) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(source)) !== null) {
      const spec = match[1];
      if (spec && (spec.startsWith(".") || spec.startsWith("/"))) {
        results.push(spec);
      }
    }
  }
  return results;
}

function normalizeToTslId(fileRelPath: string): string {
  // Ensure posix separators and ensure we keep the "src/nodes" prefix if present
  const normalized = fileRelPath.split(path.sep).join(path.posix.sep);
  return normalized.startsWith("src/nodes/")
    ? normalized
    : `src/nodes/${normalized}`;
}

async function buildGraph(dir: Directory<any>) {
  const entries = await dir.getEntries({ recursive: true });
  const files = entries.filter((e) => isFile(e) && isJavaScriptFile(e));

  const nodeIdToNode: Map<string, GraphNode> = new Map();
  const edges: GraphEdge[] = [];

  // First pass: register all files as nodes
  for (const file of files) {
    const rel = file.getRelativePathToRoot(); // e.g. src/nodes/core/Node.js
    const id = normalizeToTslId(rel);
    const segments = id.replace(/^src\/nodes\//, "").split("/");
    const category = segments[0] ?? "";
    nodeIdToNode.set(id, {
      id,
      title: file.getTitle(),
      href: file.getPathname(),
      category,
    });
  }

  const knownIds = new Set(nodeIdToNode.keys());

  // Second pass: parse imports and create edges
  for (const file of files) {
    const source = await file.getText();
    const rel = file.getRelativePathToRoot();
    const id = normalizeToTslId(rel);
    const dirName = path.posix.dirname(id);

    const specs = parseImportSpecifiers(source);
    for (const spec of specs) {
      // Resolve the spec relative to the file directory
      const resolved = path.posix.normalize(path.posix.join(dirName, spec));

      // The three.js repo usually includes extensions; try a few variants just in case
      const candidateIds = new Set<string>([
        normalizeToTslId(resolved),
        normalizeToTslId(`${resolved}.js`),
        normalizeToTslId(path.posix.join(resolved, "index.js")),
      ]);

      for (const candidate of candidateIds) {
        if (knownIds.has(candidate)) {
          edges.push({ from: id, to: candidate });
          break;
        }
      }
    }
  }

  return {
    nodes: Array.from(nodeIdToNode.values()),
    edges,
  };
}

export default async function NodeGraph() {
  const graph = await buildGraph(tslDir);

  return (
    <div className="node-graph" style={{ width: "100%", height: "100%" }}>
      <GraphView nodes={graph.nodes as any} edges={graph.edges as any} />
    </div>
  );
}
