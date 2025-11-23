## TSL Docs

This project is a documentation site for **TSL (Three Shader Language)**, a shader node system in `three.js`. It uses **Renoun** to ingest the TSL source tree, produce structured metadata, and render that structured data as a browsable docs experience.

Content is generated from the TSL codebase rather than from hand-written markdown, so the docs can stay closely aligned with the actual implementation.

## What this repository does

- **Structured data via Renoun**: Uses Renoun to scan the TSL source (types, functions, nodes, utilities, etc.) and output a normalized JSON/graph representation.
- **Docs UI**: Renders that structured data into a documentation UI with navigation, “On this page” anchors, and code-focused layouts.
- **TSL-specific semantics**: Treats TSL concepts (nodes, functions, accessors, math utilities, etc.) as first-class entities in the docs.
