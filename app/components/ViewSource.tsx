import type { CSSObject } from "restyle";
import { Link, type FileSystemEntry } from "renoun";

export function ViewSource({
  source,
  css,
}: {
  source: FileSystemEntry;
  css?: CSSObject;
}) {
  return (
    <Link
      source={source}
      variant="source"
      target="_blank"
      rel="noreferrer"
      css={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.9rem",
        letterSpacing: "0.08em",
        color: "var(--color-muted)",
        stroke: "var(--color-muted)",
        ":hover": {
          color: "var(--color-foreground)",
          stroke: "var(--color-foreground)",
        },
        ...css,
      }}
    >
      View Source
      <svg
        fill="none"
        width="1em"
        height="1em"
        stroke="inherit"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        css={{ position: "relative", top: "-0.08rem" }}
      >
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <path d="M15 3h6v6" />
        <path d="M10 14L21 3" />
      </svg>
    </Link>
  );
}
