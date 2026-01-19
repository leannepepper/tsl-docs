// tsl-collections.ts
import {
  Directory,
  GitHostFileSystem,
  isDirectory,
  type FileSystemEntry,
} from "renoun";

// Use Renoun's GitHostFileSystem to read files directly from the three.js repo
const threeRepoFs = new GitHostFileSystem({
  repository: "mrdoob/three.js",
  ref: "dev",
  host: "github",
  include: ["src/nodes"],
  token: process.env.FS_TOKEN,
});

const TSL_ROOT = "src/nodes";

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
    key: dir.slug,
    label: dir.title,
    dir,
  }));
