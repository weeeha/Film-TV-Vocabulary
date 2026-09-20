import { posix } from "node:path";
import type { Catalog, RouteRegistry } from "./types";
export const pilotPath = "docs/pilots/lighting-2026-09-20.md";
export const assetDir = "assets/lighting-pilot/2026-09-20";
export const documents = {
  "guides/how-to-use.md": "/guides/how-to-use",
  "guides/entry-template.md": "/guides/entry-template",
  "guides/agent-representation.md": "/guides/agent-representation",
  "examples/discovery-scene.md": "/examples/discovery-scene",
  "docs/coverage.md": "/reference/coverage",
  "docs/initial-outline.md": "/reference/initial-outline",
};
export const downloads = {
  "data/catalog.json": "/downloads/catalog.json",
  "data/decision.schema.json": "/downloads/decision.schema.json",
  "data/seed-coverage.json": "/downloads/seed-coverage.json",
  "examples/discovery-scene.json": "/downloads/discovery-scene.json",
};
export function buildRegistry(
  c: Catalog,
  includePilot: boolean,
): RouteRegistry {
  const r = new Map<string, string>([
      ["README.md", "/"],
      ["INDEX.md", "/terms"],
      ...Object.entries(documents),
      ...Object.entries(downloads),
    ]),
    used = new Set(r.values());
  for (const ch of c.chapters) {
    const url = "/wiki/" + ch.id;
    if (r.has(ch.source_path) || used.has(url))
      throw new Error("Route collision: " + ch.source_path);
    r.set(ch.source_path, url);
    used.add(url);
  }
  if (includePilot) {
    r.set(pilotPath, "/illustrations/lighting");
    r.set(assetDir + "/prompts.json", "/downloads/lighting-prompts.json");
    r.set(assetDir + "/manifest.json", "/downloads/lighting-manifest.json");
    r.set(
      assetDir + "/generation-receipts.json",
      "/downloads/lighting-generation-receipts.json",
    );
  }
  return r;
}
export function resolveLink(
  source: string,
  href: string,
  r: RouteRegistry,
): string {
  if (/^(https?:|mailto:)/i.test(href)) return href;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//"))
    throw new Error(source + ": unsafe link " + href);
  const parsed = href.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/)!;
  const file = decodeURIComponent(parsed[1]),
    query = parsed[2] || "",
    fragment = parsed[3] || "";
  const target = file
    ? posix.normalize(posix.join(posix.dirname(source), file))
    : source;
  if (file.startsWith("/") || target.startsWith("../") || target.includes("\\"))
    throw new Error(source + ": outside authored content " + href);
  const url = r.get(target);
  if (!url) throw new Error(source + ": unpublished or missing target " + href);
  return url + query + fragment;
}
