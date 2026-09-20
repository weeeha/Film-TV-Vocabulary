import {
  Children,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from "react";
function elements(children: ReactNode) {
  return Children.toArray(children).filter(isValidElement) as ReactElement<{
    children: ReactNode;
  }>[];
}
export function ComparisonTable({ children }: { children: ReactNode }) {
  const rows = elements(children)
    .flatMap((section) => elements(section.props.children))
    .map((row) => elements(row.props.children));
  if (
    rows.length !== 3 ||
    !rows[0].length ||
    !rows.every((r) => r.length === rows[0].length)
  )
    throw new Error(
      "Illustration comparisons require matching title, image and caption rows.",
    );
  return (
    <div className="comparison-grid">
      {rows[0].map((cell, i) => (
        <figure key={i}>
          <div className="comparison-title">{cell.props.children}</div>
          {rows[1][i].props.children}
          <figcaption>{rows[2][i].props.children}</figcaption>
        </figure>
      ))}
    </div>
  );
}
