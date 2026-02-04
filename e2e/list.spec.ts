import { test, expect } from "@playwright/test";

test.describe("List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  test("shows the loading data message", async ({ page }) => {
    await expect(page.getByText("Loading table")).toBeVisible();
  });

  // test("shows the table", async ({ page }) => {
  //   await expect(page.getByTestId("stocklist")).toBeVisible();
  // });
});
