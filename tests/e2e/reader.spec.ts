import { test, expect } from "@playwright/test";
test("home presents the atlas and navigable chapters", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Find the words. Shape the scene." }),
  ).toBeVisible();
  await expect(
    page.locator("main").getByRole("link", { name: /Lighting and color/ }),
  ).toBeVisible();
});
test("chapter prose and both term addresses are available", async ({
  page,
}) => {
  await page.goto("/wiki/lighting-and-color#lighting-and-color.key-light");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Lighting and color",
  );
  await expect(
    page.locator('[id="lighting-and-color.key-light"]'),
  ).toBeAttached();
  await expect(page.locator('[id="key-light"]')).toBeAttached();
  await expect(page.locator('[id="key-light"]')).toBeInViewport();
  await expect(
    page.getByText("The principal source or contribution", { exact: false }),
  ).toBeVisible();
});
test("unknown routes provide navigation instead of a blank page", async ({
  page,
}) => {
  const response = await page.goto("/not-a-real-chapter");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("link", { name: "Back to the atlas" }),
  ).toBeVisible();
});
test("reading remains usable without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    storageState: process.env.ATLAS_STORAGE_STATE,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/wiki/lighting-and-color");
  await expect(
    page.getByText("The principal source or contribution", { exact: false }),
  ).toBeVisible();
  await expect(
    page
      .locator('main a[href="/wiki/shot-size-angle-and-composition"]')
      .first(),
  ).toBeAttached();
  await context.close();
});

test("chapter navigation opens the vocabulary index", async ({
  page,
  isMobile,
}) => {
  await page.goto("/wiki/lighting-and-color");
  if (isMobile)
    await page.getByRole("button", { name: "Open Sidebar" }).click();
  await page
    .getByRole("link", { name: "Alphabetical index", exact: true })
    .filter({ visible: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/terms/);
  await expect(page.getByLabel("Filter terms")).toBeVisible();
});
