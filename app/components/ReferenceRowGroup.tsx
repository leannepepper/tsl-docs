"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type ReactElement,
  type ReactNode,
  useMemo,
  useState,
} from "react";

type TableRowProps = {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLTableRowElement>;
  tabIndex?: number;
  role?: string;
  "aria-expanded"?: boolean;
};

type TableCellProps = { children?: ReactNode; className?: string };

type Props = {
  hasSubRow?: boolean;
  children: ReactNode;
};

export function ReferenceRowGroup({ hasSubRow, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const childArray = useMemo(() => Children.toArray(children), [children]);
  const row = childArray[0] as ReactElement<TableRowProps> | undefined;
  const subRow = childArray[1] as ReactElement<TableRowProps> | undefined;

  if (!hasSubRow || !row || !isValidElement(row)) {
    return <>{children}</>;
  }

  const toggle = () => setIsOpen((open) => !open);

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  const rowChildrenArray = getChildrenArray(row);
  const firstCell = rowChildrenArray[0] as
    | ReactElement<TableCellProps>
    | undefined;

  const clonedFirstCell =
    firstCell &&
    isValidElement(firstCell) &&
    cloneElement(
      firstCell,
      undefined,
      <>
        <span className="reference-table__toggle" aria-hidden="true">
          {isOpen ? "▾" : "▸"}
        </span>
        {(firstCell.props as { children?: ReactNode })?.children}
      </>
    );

  const rowChildren = firstCell
    ? [clonedFirstCell, ...rowChildrenArray.slice(1)]
    : rowChildrenArray;

  const interactiveRow = cloneElement(
    row,
    {
      className: mergeClassName(
        (row.props as { className?: string }).className,
        "reference-table__row--toggle"
      ),
      role: "row",
      tabIndex: 0,
      "aria-expanded": isOpen,
      onClick: toggle,
      onKeyDown: handleKeyDown,
      children: rowChildren,
    }
  );

  const renderedSubRow =
    subRow && isValidElement(subRow)
      ? cloneElement(subRow, {
          style: {
            ...(subRow.props as { style?: CSSProperties }).style,
            display: isOpen ? "table-row" : "none",
          },
        })
      : subRow;

  return (
    <>
      {interactiveRow}
      {renderedSubRow}
    </>
  );
}

const getChildrenArray = (
  element: ReactElement<{ children?: ReactNode }>
): ReactNode[] => {
  const props = element.props;
  return Children.toArray(props.children);
};

function mergeClassName(
  existing: string | undefined,
  appended: string
): string {
  return [existing, appended].filter(Boolean).join(" ");
}
