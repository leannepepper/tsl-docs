import type { ComponentProps } from "react";
import { CodeBlock } from "renoun";

export const markdownComponents = {
  pre: (props: ComponentProps<"pre">) => (
    <CodeBlock {...props} allowErrors showErrors />
  ),
  // code: (props: ComponentProps<"code">) => <CodeInline {...props} />,
};
