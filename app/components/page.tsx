import { TSLDirectory } from "@/collections";
import { Markdown, Reference, ReferenceComponents } from "renoun/components";

const gapSizes = {
  small: "0.5rem",
  medium: "1rem",
  large: "2rem",
};

const components = {
  Column: ({ gap, ...props }) => (
    <div
      {...props}
      css={{
        display: "flex",
        flexDirection: "column",
        gap: gap ? gapSizes[gap] : undefined,
      }}
    />
  ),
  Row: ({ gap, ...props }) => (
    <div
      {...props}
      css={{
        display: "flex",
        flexDirection: "row",
        gap: gap ? gapSizes[gap] : undefined,
      }}
    />
  ),
  SectionHeading: (props) => (
    <h3
      {...props}
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        fontSize: "var(--font-size-heading-2)",
        lineHeight: "var(--line-height-heading-2)",
        fontWeight: "var(--font-weight-heading)",
        marginBottom: "1.6rem",

        "& span": {
          textTransform: "uppercase",
          letterSpacing: "0.1rem",
          fontSize: "var(--font-size-title)",
          lineHeight: 1,
          color: "var(--color-foreground-secondary)",
        },
      }}
    />
  ),
  Detail: (props) => (
    <div
      {...props}
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginBottom: "1rem",
      }}
    />
  ),
  DetailHeading: (props) => (
    <h4
      {...props}
      css={{
        fontSize: "var(--font-size-heading-3)",
        lineHeight: "var(--line-height-heading-3)",
        fontWeight: "var(--font-weight-heading)",
        marginBottom: "1.6rem",
      }}
    />
  ),
  Code: (props) => (
    <code
      {...props}
      css={{
        color: "var(--color-foreground-interactive)",
      }}
    />
  ),
  Description: (props) => (
    <Markdown
      {...props}
      components={{
        p: (props) => (
          <p
            {...props}
            css={{
              fontSize: "var(--font-size-body-2)",
              lineHeight: "var(--line-height-body-2)",
            }}
          />
        ),
        code: (props) => (
          <code
            {...props}
            css={{
              color: "var(--color-foreground-interactive)",
            }}
          />
        ),
      }}
    />
  ),
  Table: (props) => (
    <table
      {...props}
      css={{
        width: "100%",
        tableLayout: "fixed",
        fontSize: "var(--font-size-body-2)",
        lineHeight: "var(--line-height-body-2)",
        borderBottom: "1px solid var(--color-separator)",
        borderCollapse: "collapse",
      }}
    />
  ),
  TableRow: ({ hasSubRow, ...props }) => (
    <tr
      {...props}
      css={{
        borderBottom: "1px solid var(--color-separator)",
      }}
    />
  ),
  TableHeader: (props) => (
    <th
      {...props}
      css={{
        textAlign: "left",
        fontWeight: "var(--font-weight-heading)",
        padding: "0.5rem 0",
        color: "var(--color-foreground)",
      }}
    />
  ),
  TableData: ({ index, hasSubRow, ...props }) => (
    <td
      {...props}
      css={{
        width: "100%",
        padding: "0.5rem 0",
        whiteSpace: "nowrap",
        overflow: "auto",

        ":nth-child(1)": {
          maxWidth: "30.77%",
        },
        ":nth-child(2)": {
          maxWidth: "38.46%",
        },
        ":nth-child(3)": {
          maxWidth: "30.77%",
        },
      }}
    />
  ),
} satisfies Partial<ReferenceComponents>;

export default async function Components() {
  const file = await TSLDirectory.getFile("Nodes.js");
  const fileExports = await file.getExports();

  return (
    <main
      css={{
        display: "grid",
        padding: "4rem 0",
        gap: "10rem",
      }}
    >
      {fileExports.slice(0, 10).map((fileExport) => {
        return (
          <div
            key={fileExport.getName()}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              backgroundColor: "deeppink",
            }}
          >
            {fileExport.getName()}
            <Reference source={fileExport} components={components} />
          </div>
        );
      })}
    </main>
  );
}
