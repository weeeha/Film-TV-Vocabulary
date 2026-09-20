import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdtemp, cp, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { prepareAtlas } from "../../lib/content/prepare";
import { loadCatalog } from "../../lib/content/catalog";
import { buildRegistry, resolveLink } from "../../lib/content/routes";

async function fixture(run: (root: string) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), "atlas-test-"));
  try {
    for (const p of [
      "README.md",
      "INDEX.md",
      "wiki",
      "guides",
      "examples",
      "data",
      "docs",
      "assets",
    ])
      await cp(p, join(root, p), { recursive: true });
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
test("relative, encoded, fragment and download links resolve from the original source", async () => {
  const c = JSON.parse(await readFile("data/catalog.json", "utf8"));
  const r = buildRegistry(c, true);
  assert.equal(
    resolveLink(
      "guides/how-to-use.md",
      "../wiki/17-lighting-and-color.md#key-light",
      r,
    ),
    "/wiki/lighting-and-color#key-light",
  );
  r.set("guides/encoded name.md", "/guides/encoded-name");
  assert.equal(
    resolveLink("README.md", "guides/encoded%20name.md#detail", r),
    "/guides/encoded-name#detail",
  );
  assert.equal(
    resolveLink("wiki/17-lighting-and-color.md", "#key-light", r),
    "/wiki/lighting-and-color#key-light",
  );
  assert.equal(
    resolveLink("examples/discovery-scene.md", "discovery-scene.json", r),
    "/downloads/discovery-scene.json",
  );
  for (const unsafe of [
    "javascript:alert(1)",
    "../../private.md",
    "missing.md",
  ])
    assert.throws(() => resolveLink("README.md", unsafe, r));
});
test("every entry has its stable destination and existing heading anchor", async () => {
  const atlas = await prepareAtlas(process.cwd());
  const c = JSON.parse(await readFile("data/catalog.json", "utf8"));
  assert.equal(atlas.terms.length, c.entry_count);
  assert.equal(atlas.chapters.length, c.chapter_count);
  assert.equal(atlas.pilot.included, true);
  for (const term of atlas.terms) {
    const page = atlas.pages.find((p) => p.sourcePath === term.source_path)!;
    assert.ok(page.anchors.includes(term.id), term.id);
    assert.ok(page.anchors.includes(term.anchor), term.anchor);
    assert.equal(term.url, page.url + "#" + term.id);
  }
  assert.ok(atlas.search.some((r) => r.kind === "section"));
  assert.equal(
    atlas.pages.some((p) => p.sourcePath.includes("superpowers")),
    false,
  );
});
test("renaming a display label retains the persistent term address", async () =>
  fixture(async (root) => {
    const path = join(root, "wiki/17-lighting-and-color.md");
    const body = (await readFile(path, "utf8")).replace(
      "### Key light\n",
      "### Principal light\n",
    );
    await writeFile(path, body);
    const c = JSON.parse(
      await readFile(join(root, "data/catalog.json"), "utf8"),
    );
    const e = c.entries.find(
      (e: any) => e.id === "lighting-and-color.key-light",
    );
    e.name = "Principal light";
    e.anchor = "principal-light";
    c.chapters.find((c: any) => c.id === "lighting-and-color").sha256 =
      createHash("sha256").update(body).digest("hex");
    await writeFile(join(root, "data/catalog.json"), JSON.stringify(c));
    // Update authored links, as the existing authoring workflow requires after a rename.
    for (const dir of ["wiki", "guides", "examples", "docs/pilots"]) {
      const { readdir } = await import("node:fs/promises");
      for (const file of await readdir(join(root, dir)))
        if (file.endsWith(".md")) {
          const p = join(root, dir, file),
            t = await readFile(p, "utf8");
          if (t.includes("#key-light"))
            await writeFile(p, t.replaceAll("#key-light", "#principal-light"));
        }
    }
    // Recompute hashes for authored chapters changed by link migration.
    for (const ch of c.chapters)
      ch.sha256 = createHash("sha256")
        .update(await readFile(join(root, ch.source_path)))
        .digest("hex");
    await writeFile(join(root, "data/catalog.json"), JSON.stringify(c));
    const atlas = await prepareAtlas(root);
    assert.equal(
      atlas.terms.find((t) => t.id === e.id)?.url,
      "/wiki/lighting-and-color#lighting-and-color.key-light",
    );
  }));
test("catalog validation rejects stale hashes, duplicate IDs and missing fields", async () =>
  fixture(async (root) => {
    const path = join(root, "data/catalog.json"),
      raw = await readFile(path, "utf8"),
      c = JSON.parse(raw);
    c.chapters[0].sha256 = "0".repeat(64);
    await writeFile(path, JSON.stringify(c));
    await assert.rejects(loadCatalog(root), /stale|hash/i);
    const dup = JSON.parse(raw);
    dup.entries[1].id = dup.entries[0].id;
    await writeFile(path, JSON.stringify(dup));
    await assert.rejects(loadCatalog(root), /duplicate/i);
    const bad = JSON.parse(raw);
    delete bad.entries[0].definition;
    await writeFile(path, JSON.stringify(bad));
    await assert.rejects(loadCatalog(root));
  }));
test("route collisions are rejected", async () => {
  const c = JSON.parse(await readFile("data/catalog.json", "utf8"));
  c.chapters[1].id = c.chapters[0].id;
  assert.throws(() => buildRegistry(c, true), /collision|duplicate/i);
});
test("missing pilot image excludes only the pilot and its promo", async () =>
  fixture(async (root) => {
    await rm(join(root, "assets/lighting-pilot/2026-09-20/05-hard-light.png"));
    const atlas = await prepareAtlas(root);
    assert.equal(atlas.pilot.included, false);
    assert.ok(atlas.pilot.reasons.length);
    assert.equal(
      atlas.pages.some((p) => p.url === "/illustrations/lighting"),
      false,
    );
    assert.equal(
      atlas.pages.some((p) => p.markdown.includes("/illustrations/lighting")),
      false,
    );
  }));
test("invalid public fragments fail with a source location", async () =>
  fixture(async (root) => {
    const path = join(root, "guides/how-to-use.md");
    await writeFile(
      path,
      (await readFile(path, "utf8")) +
        "\n[Broken](../wiki/17-lighting-and-color.md#not-an-anchor)\n",
    );
    await assert.rejects(prepareAtlas(root), /how-to-use.*not-an-anchor/);
  }));
