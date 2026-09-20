import test from "node:test";
import assert from "node:assert/strict";
import { searchRecords, loadSearchRecords } from "../../lib/search";
import type { SearchRecord } from "../../lib/content/types";
const records: SearchRecord[] = [
  {
    id: "sound.theme",
    title: "Theme",
    context: "Sound",
    text: "Recurring music",
    url: "/wiki/sound#sound.theme",
    kind: "term",
  },
  {
    id: "story.theme",
    title: "Theme",
    context: "Story",
    text: "Underlying meaning",
    url: "/wiki/story#story.theme",
    kind: "term",
  },
  {
    id: "story.thematic",
    title: "Thematic echo",
    context: "Story",
    text: "Echoes",
    url: "/wiki/story#echo",
    kind: "term",
  },
  {
    id: "story.motif",
    title: "Motif",
    context: "Story",
    text: "Supports a theme",
    url: "/wiki/story#motif",
    kind: "term",
  },
];
test("exact titles precede body matches and retain distinct contexts", () => {
  const found = searchRecords(records, "  THEME  ");
  assert.deepEqual(
    new Set(found.slice(0, 2).map((r) => r.context)),
    new Set(["Sound", "Story"]),
  );
  assert.equal(found.at(-1)?.id, "story.motif");
  assert.deepEqual(searchRecords(records, " "), []);
  assert.deepEqual(searchRecords(records, "zzzxunknown"), []);
  assert.equal(searchRecords(records, "theme story")[0].id, "story.theme");
  assert.deepEqual(searchRecords(records, "thème", 1).length, 1);
  assert.equal(searchRecords(records, "them").at(-1)?.id, "story.motif");
});
test("failed load clears cache; retry validates and caches the successful response", async () => {
  const original = global.fetch;
  let calls = 0;
  global.fetch = async () => {
    calls++;
    return calls === 1
      ? new Response("bad", { status: 503 })
      : Response.json(records);
  };
  try {
    await assert.rejects(loadSearchRecords());
    assert.deepEqual(await loadSearchRecords(), records);
    await loadSearchRecords();
    assert.equal(calls, 2);
  } finally {
    global.fetch = original;
  }
});
