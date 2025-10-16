// tsl-collections.ts
import path from "node:path";
import { Directory, GitHostFileSystem } from "renoun";

// Path to the wiki page https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language#learning-tsl
const TSL_WIKI_PATH = "wiki/Three.js-Shading-Language";

// Use Renoun's GitHostFileSystem to read files directly from the three.js repo
const threeRepoFs = new GitHostFileSystem({
  repository: "mrdoob/three.js",
  ref: "dev",
  host: "github",
  include: ["src/nodes"],
});

const TSL_ROOT = "src/nodes";

// ---- NodeMaterials (separate top-level bucket)
export const materialsDir = new Directory({
  path: path.join(TSL_ROOT, "materialx"),
  filter: "*.js",
  basePathname: "/api/node-materials",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
});

// ---- Exact hierarchy from your snippet

// constants (single file)
export const constantsPath = path.join(TSL_ROOT, "core", "constants.js");

// Base directory for all TSL files
export const tslDir = new Directory({
  path: TSL_ROOT,
  // path: './src/nodes',
  // baseDirectory: './three',
  filter: "*.js",
  basePathname: "/api/tsl",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
});

// core
export const coreDir = new Directory({
  path: path.join(TSL_ROOT, "core"),
  filter: "*.js",
  basePathname: "/api/tsl/core",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
});

// utils
export const utilsDir = new Directory({
  path: path.join(TSL_ROOT, "utils"),
  filter: "*.js",
  basePathname: "/api/tsl/utils",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
});

// math
export const mathDir = new Directory({
  path: path.join(TSL_ROOT, "math"),
  filter: "*.js",
  basePathname: "/api/tsl/math",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
});

// accessors
export const accessorsDir = new Directory({
  path: path.join(TSL_ROOT, "accessors"),
  filter: "*.js",
  basePathname: "/api/tsl/accessors",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
});

// display
export const displayDir = new Directory({
  path: path.join(TSL_ROOT, "display"),
  filter: "*.js",
  basePathname: "/api/tsl/display",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
});

// code
export const codeDir = new Directory({
  path: path.join(TSL_ROOT, "code"),
  filter: "*.js",
  basePathname: "/api/tsl/code",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
});

// geometry
export const geometryDir = new Directory({
  path: path.join(TSL_ROOT, "geometry"),
  filter: "*.js",
  basePathname: "/api/tsl/geometry",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
});

// gpgpu
export const gpgpuDir = new Directory({
  path: path.join(TSL_ROOT, "gpgpu"),
  filter: "*.js",
  basePathname: "/api/tsl/gpgpu",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
});

// lighting
export const lightingDir = new Directory({
  path: path.join(TSL_ROOT, "lighting"),
  filter: "*.js",
  basePathname: "/api/tsl/lighting",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
});

// pmrem
export const pmremDir = new Directory({
  path: path.join(TSL_ROOT, "pmrem"),
  filter: "*.js",
  basePathname: "/api/tsl/pmrem",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
});

// parsers
export const parsersDir = new Directory({
  path: path.join(TSL_ROOT, "parsers"),
  filter: "*.js",
  basePathname: "/api/tsl/parsers",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
});

// lighting models
export const lightingModelsDir = new Directory({
  path: path.join(TSL_ROOT, "functions"),
  filter: "*.LightingModel.js",
  basePathname: "/api/tsl/lighting-models",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
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
