import { test, expect } from "@playwright/test";

test.describe("Price Options", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  test("has label", async ({ page }) => {
    await expect(page.getByText("View prices for day…")).toBeVisible();
  });

  test("has the radio buttons and one is checked", async ({ page }) => {
    const closeEl = page.getByTestId("radio-Close");
    const highEl = page.getByTestId("radio-High");
    const lowEl = page.getByTestId("radio-Low");
    const openEl = page.getByTestId("radio-Open");

    await expect(closeEl).toBeVisible();
    await expect(closeEl).toHaveValue("Close");
    await expect(closeEl).toBeChecked();

    await expect(highEl).toBeVisible();
    await expect(highEl).toHaveValue("High");

    await expect(lowEl).toBeVisible();
    await expect(lowEl).toHaveValue("Low");

    await expect(openEl).toBeVisible();
    await expect(openEl).toHaveValue("Open");
  });

  test("can successfully change the option", async ({ page }) => {
    const closeEl = page.getByTestId("radio-Close");
    const highEl = page.getByTestId("radio-High");
    const lowEl = page.getByTestId("radio-Low");
    const openEl = page.getByTestId("radio-Open");

    await highEl.click();
    await expect(highEl).toBeChecked();
    await expect(closeEl).not.toBeChecked();

    await lowEl.click();
    await expect(lowEl).toBeChecked();
    await expect(highEl).not.toBeChecked();

    await openEl.click();
    await expect(openEl).toBeChecked();
    await expect(lowEl).not.toBeChecked();

    await closeEl.click();
    await expect(closeEl).toBeChecked();
    await expect(openEl).not.toBeChecked();
  });
});
