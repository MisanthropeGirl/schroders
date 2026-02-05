import { test, expect } from "@playwright/test";
import { stockListApiOutput, stockListApiOutputEmpty } from "../src/mocks/StockList";
import { POLYGON_LIST_URL } from "../src/constants";

test.describe("List", () => {
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

  test("it loads correctly", async ({ page }) => {
    await expect(page.getByText("Loading table")).toBeVisible();

    const table = page.getByTestId("stocklist");

    await expect(table).toBeVisible();
    await expect(table.getByRole("checkbox")).toHaveCount(10);

    await expect(page.getByText("Loading table")).not.toBeVisible();
  });

  test("it shows are empty table when there is no data", async ({ page }) => {
    await page.route(`${POLYGON_LIST_URL}*`, async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(stockListApiOutputEmpty),
      });
    });

    await page.reload();

    const table = page.getByTestId("stocklist");

    await expect(table).toBeVisible();
    await expect(table.getByRole("checkbox")).toHaveCount(0);

    await expect(page.getByText("Loading table")).not.toBeVisible();
  });

  test("it shows an error message when the API call fails", async ({ page }) => {
    await page.route(`${POLYGON_LIST_URL}*`, async route => {
      await route.fulfill({
        status: 404,
      });
    });

    await page.reload();

    await expect(page.getByText(/An error has occurred:/)).toBeVisible();
    await expect(page.getByTestId("stocklist")).not.toBeVisible();
  });

  test("the previous button is disabled until the next btn is clicked", async ({ page }) => {
    await expect(page.getByTestId("stocklist")).toBeVisible();

    const btnNext = page.getByTestId("btn-next");
    const btnPrev = page.getByTestId("btn-prev");

    await expect(btnPrev).toBeDisabled();

    await btnNext.click();
    await expect(btnPrev).toBeEnabled();
  });

  test("the previous button is disabled when we're back to the first page of results", async ({
    page,
  }) => {
    await expect(page.getByTestId("stocklist")).toBeVisible();

    const btnNext = page.getByTestId("btn-next");
    const btnPrev = page.getByTestId("btn-prev");

    await expect(btnPrev).toBeDisabled();

    await btnNext.click();
    await expect(btnPrev).toBeEnabled();

    await btnPrev.click();
    await expect(btnPrev).toBeDisabled();
  });

  test("allows selecting up to 3 tickers and disables remaining checkboxes", async ({ page }) => {
    await expect(page.getByTestId("stocklist")).toBeVisible();

    const fourthCheckbox = page.getByRole("checkbox", { name: "Select AAP" });

    await page.getByRole("checkbox", { name: "Select A", exact: true }).check();
    await expect(fourthCheckbox).toBeEnabled();

    await page.getByRole("checkbox", { name: "Select AA", exact: true }).check();
    await expect(fourthCheckbox).toBeEnabled();

    await page.getByRole("checkbox", { name: "Select AAMI" }).check();
    await expect(fourthCheckbox).toBeDisabled();

    await page.getByRole("checkbox", { name: "Select AA", exact: true }).uncheck();
    await expect(fourthCheckbox).toBeEnabled();
  });
});
