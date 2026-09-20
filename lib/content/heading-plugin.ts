import { readFileSync } from "node:fs";
import type { Root } from "hast";
import type { VFile } from "vfile";
import { visit } from "unist-util-visit";
import type { PreparedAtlas } from "./types";
export function rehypeAtlasHeadings() {
  const atlas: PreparedAtlas = JSON.parse(
    readFileSync(".generated/atlas.json", "utf8"),
  );
  return (tree: Root, file: VFile) => {
    const relative = file.path
      .split(".generated/content/")[1]
      ?.replace(/\.mdx?$/, "");
    const page = atlas.pages.find((p) => p.slug.join("/") === relative);
    if (!page) throw new Error("No prepared page for " + file.path);
    let index = 0;
    visit(tree, "element", (node) => {
      if (!/^h[1-6]$/.test(node.tagName)) return;
      const id = page.headingIds[index++];
      if (!id) throw new Error("Unexpected heading in " + file.path);
      node.properties.id = id;
    });
    if (index !== page.headingIds.length)
      throw new Error("Heading count mismatch in " + file.path);
  };
}
