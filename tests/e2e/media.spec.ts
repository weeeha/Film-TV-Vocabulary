import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { PreparedAtlas } from "../../lib/content/types";
const atlas: PreparedAtlas = JSON.parse(
  readFileSync(".generated/atlas.json", "utf8"),
);
test("lighting candidates keep images and captions together", async ({
  page,
}) => {
  await page.goto("/illustrations/lighting");
  await expect(
    page.getByText("Status: candidate illustrations.", { exact: false }),
  ).toBeVisible();
  const images = page.locator("main img");
  await expect(images).toHaveCount(12);
  await expect(page.locator("main figure")).toHaveCount(12);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
      )
      .toBe(true);
    expect(await image.getAttribute("alt")).toBeTruthy();
  }
  for (const figure of await page.locator("main figure").all()) {
    await expect(figure.locator("figcaption")).toContainText("Look for:");
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("guide renders its relationship diagram", async ({ page }) => {
  await page.goto("/guides/how-to-use");
  await expect(
    page
      .getByRole("img", { name: "Atlas relationships diagram" })
      .locator("svg"),
  ).toBeVisible();
});
test("allowlisted downloads parse and private paths stay unavailable", async ({
  request,
}) => {
  for (const asset of atlas.assets.filter((a) =>
    a.url.startsWith("/downloads/"),
  )) {
    const response = await request.get(asset.url);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("application/json");
    await response.json();
  }
  for (const path of [
    "/downloads/plan.md",
    "/downloads/private.json",
    "/docs/superpowers/plans/2026-09-20-wiki-interface.md",
  ])
    expect((await request.get(path)).status()).toBe(404);
});
test("diagram source remains readable without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    storageState: process.env.ATLAS_STORAGE_STATE,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/guides/how-to-use");
  await expect(
    page.locator("pre").filter({ hasText: "flowchart" }),
  ).toBeVisible();
  await context.close();
});

test("invalid diagram retains its readable fallback", async ({ page }) => {
  const { build } = await import("esbuild");
  const bundle = await build({
    stdin: {
      contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {MermaidDiagram} from './components/mermaid-diagram';createRoot(document.getElementById('root')).render(<><p>Surrounding guide text</p><MermaidDiagram code="not a valid diagram"/></>);`,
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    define: { "process.env.NODE_ENV": '"production"' },
  });
  await page.route("**/__diagram_fixture", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: '<div id="root"></div><script src="/__diagram_bundle"></script>',
    }),
  );
  await page.route("**/__diagram_bundle", (r) =>
    r.fulfill({
      contentType: "text/javascript",
      body: bundle.outputFiles[0].text,
    }),
  );
  await page.goto("/__diagram_fixture");
  await expect(
    page.getByText("Diagram unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator("pre")).toHaveText("not a valid diagram");
  await expect(page.getByText("Surrounding guide text")).toBeVisible();
});
