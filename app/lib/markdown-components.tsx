import type { ComponentProps } from "react";
import { CodeBlock, CodeInline, parseCodeProps, parsePreProps } from "renoun";

export const markdownComponents = {
  pre: (props: ComponentProps<"pre">) => (
    <CodeBlock {...parsePreProps(props)} />
  ),
  code: (props: ComponentProps<"code">) => (
    <CodeInline {...parseCodeProps(props)} />
  ),
};
