// tsl-collections.ts
import path from "node:path";
import {
  Directory,
  GitHostFileSystem,
  isDirectory,
  type FileSystemEntry,
} from "renoun";

// Path to the wiki page https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language#learning-tsl
const TSL_WIKI_PATH = "wiki/Three.js-Shading-Language";

// Use Renoun's GitHostFileSystem to read files directly from the three.js repo
const threeRepoFs = new GitHostFileSystem({
  repository: "mrdoob/three.js",
  ref: "master",
  host: "github",
  include: ["src/nodes"],
  token: process.env.FS_TOKEN,
});

const TSL_ROOT = "src/nodes";

export const constantsPath = path.join(TSL_ROOT, "core", "constants.js");

// Base directory for all TSL files
export const tslDir = new Directory({
  path: TSL_ROOT,
  basePathname: "/",
  slugCasing: "kebab",
  fileSystem: threeRepoFs,
  filter: "**/*.js",
});

const tslDirectoryEntries = await tslDir.getEntries();

// get all the categories to be displayed in the sidebar
export const tslCategories = tslDirectoryEntries
  .filter((entry: FileSystemEntry) => isDirectory(entry))
  .map((dir) => ({
    key: dir.getSlug(),
    label: dir.getTitle(),
    dir,
  }));
