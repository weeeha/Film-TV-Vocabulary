import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import { rehypeAtlasHeadings } from "./lib/content/heading-plugin";
export const docs = defineDocs({ dir: ".generated/content" });
export default defineConfig({
  mdxOptions: {
    remarkImageOptions: false,
    rehypeCodeOptions: false,
    rehypePlugins: [rehypeAtlasHeadings],
  },
});
