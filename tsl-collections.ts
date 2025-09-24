import { Directory } from "renoun";

const TSL_ROOT = "./three/src/nodes";

// --- NodeMaterials
export const materialsDir = new Directory({
  path: `${TSL_ROOT}/materials`,
  //   include: "*.js",
  //   basePathname: "/api/node-materials",
  //   slugCasing: "kebab",
  //   loader: {
  //     js: (p) => import(`three/src/nodes/materials/${p}.js`),
  //   },
});

// --- Nodes: Inputs
export const inputsDirs = [
  new Directory({
    path: `${TSL_ROOT}/inputs`,
    // include: "*.js",
    // basePathname: "/api/nodes/inputs",
    // slugCasing: "kebab",
    // loader: { js: (p) => import(`three/src/nodes/inputs/${p}.js`) },
  }),
  new Directory({
    path: `${TSL_ROOT}/accessors`,
    // include: "*.js",
    // basePathname: "/api/nodes/inputs",
    // slugCasing: "kebab",
    // loader: { js: (p) => import(`three/src/nodes/accessors/${p}.js`) },
  }),
  new Directory({
    path: `${TSL_ROOT}/core`,
    // include: "*.js",
    // basePathname: "/api/nodes/inputs",
    // slugCasing: "kebab",
    // loader: { js: (p) => import(`three/src/nodes/core/${p}.js`) },
  }),
];

// --- Nodes: Math & Ops
export const mathDirs = [
  new Directory({
    path: `${TSL_ROOT}/math`,
    // include: "*.js",
    // basePathname: "/api/nodes/math",
    // slugCasing: "kebab",
    // loader: { js: (p) => import(`three/src/nodes/math/${p}.js`) },
  }),
  new Directory({
    path: `${TSL_ROOT}/operator`,
    // include: "*.js",
    // basePathname: "/api/nodes/math",
    // slugCasing: "kebab",
    // loader: { js: (p) => import(`three/src/nodes/operator/${p}.js`) },
  }),
  new Directory({
    path: `${TSL_ROOT}/utils`,
    // include: "*.js",
    // basePathname: "/api/nodes/math",
    // slugCasing: "kebab",
    // loader: { js: (p) => import(`three/src/nodes/utils/${p}.js`) },
  }),
];

// --- Nodes: Lighting
export const lightingDir = new Directory({
  path: `${TSL_ROOT}/lights`,
  //   include: "*.js",
  //   basePathname: "/api/nodes/lighting",
  //   slugCasing: "kebab",
  //   loader: { js: (p) => import(`three/src/nodes/lights/${p}.js`) },
});

// --- Nodes: Utility (color/texture/normal/etc.)
export const utilityDirs = [
  new Directory({
    path: `${TSL_ROOT}/color`,
    // include: "*.js",
    // basePathname: "/api/nodes/utility",
    // slugCasing: "kebab",
    // loader: { js: (p) => import(`three/src/nodes/color/${p}.js`) },
  }),
  new Directory({
    path: `${TSL_ROOT}/textures`,
    // include: "*.js",
    // basePathname: "/api/nodes/utility",
    // slugCasing: "kebab",
    // loader: { js: (p) => import(`three/src/nodes/textures/${p}.js`) },
  }),
];

// --- Nodes: Viewport & Post
export const postDirs = [
  new Directory({
    path: `${TSL_ROOT}/viewport`,
    // include: "*.js",
    // basePathname: "/api/nodes/viewport-post",
    // slugCasing: "kebab",
    // loader: { js: (p) => import(`three/src/nodes/viewport/${p}.js`) },
  }),
  new Directory({
    path: `${TSL_ROOT}/postprocessing`,
    // include: "*.js",
    // basePathname: "/api/nodes/viewport-post",
    // slugCasing: "kebab",
    // loader: { js: (p) => import(`three/src/nodes/postprocessing/${p}.js`) },
  }),
];

// --- Advanced (MaterialX, loaders)
export const materialxDir = new Directory({
  path: `${TSL_ROOT}/materialx`,
  //   include: "*.js",
  //   basePathname: "/api/materialx",
  //   slugCasing: "kebab",
  //   loader: { js: (p) => import(`three/src/nodes/materialx/${p}.js`) },
});

export const loadersDir = new Directory({
  path: "node_modules/three/src/loaders",
  //   include: "*Node*.js",
  //   basePathname: "/api/loading",
  //   slugCasing: "kebab",
  //   loader: { js: (p) => import(`three/src/loaders/${p}.js`) },
});

// --- Functions (Factories) – single page from TSL entry
export const tslEntryPath = `${TSL_ROOT}/TSL.js`; // master export of factories
