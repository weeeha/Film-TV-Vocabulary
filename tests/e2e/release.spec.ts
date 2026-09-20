import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { PreparedAtlas } from "../../lib/content/types";
const atlas: PreparedAtlas = JSON.parse(
  readFileSync(".generated/atlas.json", "utf8"),
);
test("every published page preserves all anchors without duplicate IDs", async ({
  page,
}) => {
  await page.goto("/");
  for (const prepared of atlas.pages) {
    const response = await page.request.get(prepared.url);
    expect(response.ok(), prepared.url).toBe(true);
    const html = await response.text();
    const ids = await page.evaluate(
      (markup) =>
        [
          ...new DOMParser()
            .parseFromString(markup, "text/html")
            .querySelectorAll("[id]"),
        ].map((el) => el.id),
      html,
    );
    for (const id of prepared.anchors)
      expect(ids, prepared.url + "#" + id).toContain(id);
    expect(new Set(ids).size, prepared.url).toBe(ids.length);
  }
});
test("key reading surfaces stay within the viewport", async ({
  page,
}, testInfo) => {
  for (const [name, path] of [
    ["home", "/"],
    ["chapter", "/wiki/lighting-and-color"],
    ["terms", "/terms?q=theme"],
    ["guide", "/guides/how-to-use"],
    ["lighting", "/illustrations/lighting"],
    ["404", "/missing-page"],
  ]) {
    await page.goto(path);
    await expect(page.locator("main")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      path,
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(name + ".png") });
  }
});
test("keyboard skip, theme and related chapter navigation work", async ({
  page,
  isMobile,
}) => {
  await page.goto("/wiki/lighting-and-color");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#nd-page")).toBeInViewport();
  await page
    .locator('main a[href="/wiki/shot-size-angle-and-composition"]')
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Shot size",
  );
  if (isMobile)
    await page.getByRole("button", { name: "Open Sidebar" }).click();
  await page
    .getByRole("button", { name: "Toggle Theme", exact: true })
    .filter({ visible: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("the missing-page message uses the available reading width", async ({
  page,
}) => {
  await page.goto("/missing-page");
  const width = await page
    .locator("main")
    .evaluate((el) => el.getBoundingClientRect().width);
  expect(width).toBeGreaterThan(Math.min(page.viewportSize()!.width - 40, 500));
});
