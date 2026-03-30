import { Directory, Repository } from "renoun";

export const tslRepository = Repository.remote({
  path: "https://github.com/mrdoob/three.js",
  ref: "dev",
});

export const tslDir = new Directory({
  path: "src/nodes",
  filter: "**/*.js",
  repository: tslRepository,
});
