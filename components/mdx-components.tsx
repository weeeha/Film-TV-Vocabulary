import defaults from "fumadocs-ui/mdx";
import { Children, isValidElement } from "react";
import type { MDXComponents } from "mdx/types";
import type { PreparedPage } from "@/lib/content/types";
import { atlas } from "@/lib/atlas";
import { TermHeading } from "./term-heading";
import { Illustration } from "./illustration";
import { ComparisonTable } from "./comparison-table";
import { MermaidDiagram } from "./mermaid-diagram";
export function getMDXComponents(page: PreparedPage): MDXComponents {
  return {
    ...defaults,
    h3: ({ id, children }) => (
      <TermHeading legacyId={id ?? ""} stableId={page.termAnchors[id ?? ""]}>
        {children}
      </TermHeading>
    ),
    table: ({ children, ...props }) =>
      page.url === "/illustrations/lighting" ? (
        <ComparisonTable>{children}</ComparisonTable>
      ) : (
        <div
          className="table-scroll"
          role="region"
          aria-label="Scrollable reference table"
          tabIndex={0}
        >
          <table {...props}>{children}</table>
        </div>
      ),
    img: ({ src, alt }) => {
      const asset = atlas.assets.find((a) => a.url === src);
      if (!asset?.width || !asset.height)
        throw new Error("Missing image metadata: " + src);
      return (
        <Illustration
          src={asset.url}
          alt={alt ?? ""}
          width={asset.width}
          height={asset.height}
        />
      );
    },
    pre: ({ children, ...props }) => {
      const child = Children.toArray(children)[0];
      if (
        isValidElement<{ className?: string; children?: string }>(child) &&
        child.props.className === "language-mermaid"
      )
        return <MermaidDiagram code={String(child.props.children ?? "")} />;
      return <pre {...props}>{children}</pre>;
    },
  };
}
