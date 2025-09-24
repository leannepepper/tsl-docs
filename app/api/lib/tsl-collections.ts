// tsl-collections.ts
import path from "node:path";
import { Directory } from "renoun";

// If you have a local clone at ./three (as in your screenshot)

const TSL_ROOT = "./three/src/nodes";

// ---- NodeMaterials (separate top-level bucket)
export const materialsDir = new Directory({
  path: path.join(TSL_ROOT, "materials"),
  filter: "*.js",
  basePathname: "/api/node-materials",
  slugCasing: "kebab",
  // no loader needed
});

// ---- Exact hierarchy from your snippet

// constants (single file)
export const constantsPath = path.join(TSL_ROOT, "core", "constants.js");

// core
export const coreDir = new Directory({
  path: path.join(TSL_ROOT, "core"),
  filter: "*.js",
  basePathname: "/api/tsl/core",
  slugCasing: "kebab",
});

// utils
export const utilsDir = new Directory({
  path: path.join(TSL_ROOT, "utils"),
  filter: "*.js",
  basePathname: "/api/tsl/utils",
  slugCasing: "kebab",
});

// math
export const mathDir = new Directory({
  path: path.join(TSL_ROOT, "math"),
  filter: "*.js",
  basePathname: "/api/tsl/math",
  slugCasing: "kebab",
});

// accessors
export const accessorsDir = new Directory({
  path: path.join(TSL_ROOT, "accessors"),
  filter: "*.js",
  basePathname: "/api/tsl/accessors",
  slugCasing: "kebab",
});

// display
export const displayDir = new Directory({
  path: path.join(TSL_ROOT, "display"),
  filter: "*.js",
  basePathname: "/api/tsl/display",
  slugCasing: "kebab",
});

// code
export const codeDir = new Directory({
  path: path.join(TSL_ROOT, "code"),
  filter: "*.js",
  basePathname: "/api/tsl/code",
  slugCasing: "kebab",
});

// geometry
export const geometryDir = new Directory({
  path: path.join(TSL_ROOT, "geometry"),
  filter: "*.js",
  basePathname: "/api/tsl/geometry",
  slugCasing: "kebab",
});

// gpgpu
export const gpgpuDir = new Directory({
  path: path.join(TSL_ROOT, "gpgpu"),
  filter: "*.js",
  basePathname: "/api/tsl/gpgpu",
  slugCasing: "kebab",
});

// lighting
export const lightingDir = new Directory({
  path: path.join(TSL_ROOT, "lighting"),
  filter: "*.js",
  basePathname: "/api/tsl/lighting",
  slugCasing: "kebab",
});

// pmrem
export const pmremDir = new Directory({
  path: path.join(TSL_ROOT, "pmrem"),
  filter: "*.js",
  basePathname: "/api/tsl/pmrem",
  slugCasing: "kebab",
});

// parsers
export const parsersDir = new Directory({
  path: path.join(TSL_ROOT, "parsers"),
  filter: "*.js",
  basePathname: "/api/tsl/parsers",
  slugCasing: "kebab",
});

// lighting models
export const lightingModelsDir = new Directory({
  path: path.join(TSL_ROOT, "functions"),
  filter: "*.LightingModel.js",
  basePathname: "/api/tsl/lighting-models",
  slugCasing: "kebab",
});

// TSL root exports page
export const tslRootPath = path.join(TSL_ROOT, "TSL.js");

export const tslCategories: {
  key: string;
  label: string;
  dir?: Directory<any>;
}[] = [
  { key: "constants", label: "constants" as const },
  { key: "core", label: "core" as const, dir: coreDir },
  { key: "utils", label: "utils" as const, dir: utilsDir },
  { key: "math", label: "math" as const, dir: mathDir },
  { key: "accessors", label: "accessors" as const, dir: accessorsDir },
  { key: "display", label: "display" as const, dir: displayDir },
  { key: "code", label: "code" as const, dir: codeDir },
  { key: "geometry", label: "geometry" as const, dir: geometryDir },
  { key: "gpgpu", label: "gpgpu" as const, dir: gpgpuDir },
  { key: "lighting", label: "lighting" as const, dir: lightingDir },
  { key: "pmrem", label: "pmrem" as const, dir: pmremDir },
  { key: "parsers", label: "parsers" as const, dir: parsersDir },
  {
    key: "lighting-models",
    label: "lighting models" as const,
    dir: lightingModelsDir,
  },
] as const;

export type TslCategoryKey = (typeof tslCategories)[number]["key"];

export function getDirForCategory(key: TslCategoryKey) {
  return tslCategories.find((c) => c.key === key)?.dir || null;
}
