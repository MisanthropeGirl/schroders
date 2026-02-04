import { test, expect } from "@playwright/test";

test.describe("Chart", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  test("shows the awaiting data message in place of a chart", async ({ page }) => {
    await expect(page.getByText("Awaiting data")).toBeVisible();
  });
});
