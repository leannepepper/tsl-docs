import {
  TableOfContents as BaseTableOfContents,
  type TableOfContentsProps,
  type TableOfContentsComponents,
} from "renoun";
import type { FileSystemEntry } from "renoun";
import { ViewSource } from "./ViewSource";

type SiteTableOfContentsProps = Omit<
  TableOfContentsProps,
  "children" | "components"
> & {
  entry?: FileSystemEntry;
};

export function OnThisPage({ headings, entry }: SiteTableOfContentsProps) {
  const components: Partial<TableOfContentsComponents> = {
    Root: (props) => (
      <nav
        {...props}
        css={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "1rem 0",
        }}
      />
    ),
    Title: ({ id }) => (
      <h4 id={id} className="title">
        On this page
      </h4>
    ),
    List: ({ children, depth }) => (
      <ol
        css={{
          "--depth": depth,
          gridColumn: "1 / 2",
          gridRow: "1 / -1",
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          margin: 0,
        }}
      >
        {children}
      </ol>
    ),
    Link: (props) => {
      return (
        <a
          {...props}
          css={{
            display: "block",
            fontSize: "0.9rem",
            padding: "0.25rem 0",
            paddingLeft: "calc(var(--depth) * 0.8rem)",
            scrollMarginBlock: "0.9rem",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            color: "var(--color-muted)",
            ":hover": {
              color: "var(--color-foreground)",
            },
            "&[aria-current]": {
              color: "var(--color-accent)",
            },
          }}
        />
      );
    },
  };

  return (
    <BaseTableOfContents headings={headings} components={components}>
      {entry ? (
        <ViewSource
          source={entry}
          css={{
            padding: "1rem 0",
            borderTop: "1px solid var(--color-border)",
          }}
        />
      ) : null}
    </BaseTableOfContents>
  );
}
