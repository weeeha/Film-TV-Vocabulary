import test from "node:test";
import assert from "node:assert/strict";
import { parseFilters, filterTerms, groupTerms } from "../../lib/terms";
import { atlas } from "../../lib/atlas";
test("filters preserve the first value and recover invalid chapters", () => {
  assert.deepEqual(
    parseFilters(new URLSearchParams("q=light&chapter=missing"), [
      "lighting-and-color",
    ]),
    { q: "light", chapter: "" },
  );
  assert.deepEqual(
    parseFilters(
      new URLSearchParams("q=light&q=dark&chapter=lighting-and-color"),
      ["lighting-and-color"],
    ),
    { q: "light", chapter: "lighting-and-color" },
  );
  assert.deepEqual(parseFilters(new URLSearchParams("q=+++"), []), {
    q: "",
    chapter: "",
  });
});
test("all contextual entries survive grouping and combined filters", () => {
  const all = filterTerms(atlas.terms, { q: "", chapter: "" });
  assert.equal(all.length, atlas.terms.length);
  assert.equal(new Set(all.map((t) => t.id)).size, atlas.terms.length);
  assert.equal([...groupTerms(all).values()].flat().length, all.length);
  const filtered = filterTerms(atlas.terms, {
    q: "KEY LIGHT",
    chapter: "lighting-and-color",
  });
  assert(filtered.some((t) => t.id === "lighting-and-color.key-light"));
  assert.equal(filtered.length, 3);
  const themes = filterTerms(atlas.terms, { q: "theme", chapter: "" });
  assert(themes.length > 1);
  assert(new Set(themes.map((t) => t.chapter_id)).size > 1);
});
