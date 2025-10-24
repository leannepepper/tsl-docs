import createMDXPlugin from "@next/mdx";

const withMDX = createMDXPlugin();

const basePathEnv = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const normalizedBasePath =
  basePathEnv && basePathEnv !== "/"
    ? basePathEnv.startsWith("/")
      ? basePathEnv
      : `/${basePathEnv}`
    : undefined;

export default withMDX({
  output: "export",
  trailingSlash: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  experimental: { mdxRs: true },
  basePath: normalizedBasePath,
  assetPrefix: normalizedBasePath,
});
