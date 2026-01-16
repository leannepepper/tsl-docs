import type { ComponentProps } from "react";
import { CodeBlock } from "renoun";

export const markdownComponents = {
  pre: (props: ComponentProps<"pre">) => (
    <CodeBlock {...props} allowErrors showErrors />
  ),
  CodeBlock: (props: ComponentProps<typeof CodeBlock>) => (
    <CodeBlock {...props} allowErrors showErrors />
  ),
};
