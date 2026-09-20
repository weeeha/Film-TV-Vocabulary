import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { hash, loadCatalog } from "./catalog";
import { buildRegistry, documents, pilotPath } from "./routes";
import { validatePilot } from "./pilot";
import { prepareDocument, plain, legacyAnchor, parser } from "./markdown";
import { toString } from "mdast-util-to-string";
import type { PreparedAtlas, PublicAsset } from "./types";
export async function prepareAtlas(root: string): Promise<PreparedAtlas> {
  const catalog = await loadCatalog(root),
    pilot = await validatePilot(root, catalog),
    routes = buildRegistry(catalog, pilot.included);
  for (const a of pilot.assets) routes.set(a.sourcePath, a.url);
  const sourcePaths = [
    ...catalog.chapters.map((c) => c.source_path),
    ...Object.keys(documents),
    ...(pilot.included ? [pilotPath] : []),
  ];
  const pages = await Promise.all(
    sourcePaths.map(async (path) =>
      prepareDocument(
        path,
        await readFile(join(root, path), "utf8"),
        catalog,
        routes,
      ),
    ),
  );
  const terms = catalog.entries.map((e) => ({
    ...e,
    chapterTitle: catalog.chapters
      .find((c) => c.id === e.chapter_id)!
      .title.replace(/^\d+\s*·\s*/, ""),
    url: routes.get(e.source_path)! + "#" + e.id,
  }));
  const assets: PublicAsset[] = [...pilot.assets];
  for (const [path, url] of routes)
    if (url.startsWith("/downloads/"))
      assets.push({
        sourcePath: path,
        url,
        sha256: hash(await readFile(join(root, path))),
      });
  const anchorMap = new Map(pages.map((p) => [p.url, new Set(p.anchors)]));
  const homeTree = parser.parse(
    await readFile(join(root, "README.md"), "utf8"),
  );
  anchorMap.set(
    "/",
    new Set(
      homeTree.children
        .filter((n) => n.type === "heading")
        .map((n) => legacyAnchor(toString(n))),
    ),
  );
  anchorMap.set(
    "/terms",
    new Set([
      "alphabetical-vocabulary-index",
      "0–9",
      ..."abcdefghijklmnopqrstuvwxyz",
    ]),
  );
  for (const p of pages)
    for (const href of p.links) {
      if (!href.startsWith("/")) continue;
      const target = new URL(href, "https://atlas.local");
      if (
        target.hash &&
        anchorMap.has(target.pathname) &&
        !anchorMap
          .get(target.pathname)!
          .has(decodeURIComponent(target.hash.slice(1)))
      )
        throw new Error(p.sourcePath + ": missing anchor " + href);
    }
  return {
    chapters: catalog.chapters,
    terms,
    pages,
    assets,
    pilot: { included: pilot.included, reasons: pilot.reasons },
    search: [
      ...terms.map((t) => ({
        id: t.id,
        title: t.name,
        context: t.chapterTitle,
        text: plain(t.definition + "\n" + t.use + "\n" + t.example),
        url: t.url,
        kind: "term" as const,
      })),
      ...pages.flatMap((p) => p.sections),
    ],
  };
}
