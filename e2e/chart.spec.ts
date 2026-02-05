import { test, expect } from "@playwright/test";
import { POLYGON_LIST_URL, POLYGON_DATA_URL } from "../src/constants";
import { stockListApiOutput } from "../src/mocks/StockList";
import { stockDataApiOutput } from "../src/mocks/Stocks";

test.describe("Chart", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${POLYGON_LIST_URL}*`, async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(stockListApiOutput),
      });
    });

    await page.goto("http://localhost:3000/");
  });

  test("shows the awaiting data message in place of a chart", async ({ page }) => {
    await expect(page.getByText("Awaiting data")).toBeVisible();
  });

  test("the chart should appear when a stock is selected", async ({ page }) => {
    await page.route(`${POLYGON_DATA_URL}/*/range/1/day/*/*`, async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(stockDataApiOutput),
      });
    });

    await page.reload();

    await expect(page.getByText("Awaiting data")).toBeVisible();
    await expect(page.getByTestId("stocklist")).toBeVisible();

    await page.getByRole("checkbox", { name: "Select A", exact: true }).check();

    await expect(page.getByText("Awaiting data")).not.toBeVisible();
    await expect(page.getByTestId("stockchart")).toBeVisible();
  });

  test("the chart should disappear when all stocks are deselected", async ({ page }) => {
    await page.route(`${POLYGON_DATA_URL}/*/range/1/day/*/*`, async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(stockDataApiOutput),
      });
    });

    await page.reload();

    const awaitingMsg = page.getByText("Awaiting data");
    const chart = page.getByTestId("stockchart");
    const firstCheckbox = page.getByRole("checkbox", { name: "Select A", exact: true });

    await expect(awaitingMsg).toBeVisible();
    await expect(page.getByTestId("stocklist")).toBeVisible();

    await firstCheckbox.check();

    await expect(awaitingMsg).not.toBeVisible();
    await expect(chart).toBeVisible();

    await firstCheckbox.uncheck();

    await expect(chart).not.toBeVisible();
    await expect(awaitingMsg).toBeVisible();
  });

  test("an error message should appear when a data load fails", async ({ page }) => {
    await page.route(`${POLYGON_DATA_URL}/*/range/1/day/*/*`, async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(stockDataApiOutput),
      });
    });

    await page.reload();

    await expect(page.getByText("Awaiting data")).toBeVisible();
    await expect(page.getByTestId("stocklist")).toBeVisible();

    await page.getByRole("checkbox", { name: "Select A", exact: true }).check();

    await expect(page.getByText("Awaiting data")).not.toBeVisible();
    await expect(page.getByTestId("stockchart")).toBeVisible();

    await page.route(`${POLYGON_DATA_URL}/*/range/1/day/*/*`, async route => {
      await route.fulfill({
        status: 500,
        body: "",
      });
    });

    await page.getByRole("checkbox", { name: "Select AA", exact: true }).check();

    await expect(page.getByText(/Failed to load AA:/)).toBeVisible();
  });
});
