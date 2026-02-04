import { test, expect } from "@playwright/test";
import {
  DATE_MAX,
  DATE_MIDDLE,
  DATE_MIDDLE_MINUS_ONE_DAY,
  DATE_MIDDLE_PLUS_ONE_DAY,
  DATE_MIN,
} from "../src/constants";

test.describe("Date selectors", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  test("shows to and from date selectors, initially populated with max and min dates", async ({
    page,
  }) => {
    const fromDate = page.getByTestId("from-date");
    const toDate = page.getByTestId("to-date");

    await expect(fromDate).toBeVisible();
    await expect(fromDate).toHaveValue(DATE_MIN);

    await expect(toDate).toBeVisible();
    await expect(toDate).toHaveValue(DATE_MAX);
  });

  test("can change the dates", async ({ page }) => {
    const fromDate = page.getByTestId("from-date");
    const toDate = page.getByTestId("to-date");

    await fromDate.fill(DATE_MIDDLE_MINUS_ONE_DAY);
    await expect(fromDate).toHaveValue(DATE_MIDDLE_MINUS_ONE_DAY);

    await toDate.fill(DATE_MIDDLE_PLUS_ONE_DAY);
    await expect(toDate).toHaveValue(DATE_MIDDLE_PLUS_ONE_DAY);
  });

  test("shows the date out of bounds error", async ({ page }) => {
    const fromDate = page.getByTestId("from-date");
    const toDate = page.getByTestId("to-date");
    const error = `Date should between ${DATE_MIN} and ${DATE_MAX}`;

    expect(page.getByText(error)).not.toBeVisible();

    // should be visible if from is out of bounds
    await fromDate.fill("1999-12-31");
    await expect(fromDate).toHaveValue("1999-12-31");
    await expect(page.getByText(error)).toBeVisible();

    // should be visible if both are out of bounds
    await toDate.fill("2099-12-31");
    await expect(toDate).toHaveValue("2099-12-31");
    await expect(page.getByText(error)).toBeVisible();

    // should be visible if to is out of bounds
    await fromDate.fill(DATE_MIN);
    await expect(fromDate).toHaveValue(DATE_MIN);
    await expect(page.getByText(error)).toBeVisible();

    // should not be visible if both are within bounds
    await toDate.fill(DATE_MAX);
    await expect(toDate).toHaveValue(DATE_MAX);
    await expect(page.getByText(error)).not.toBeVisible();
  });

  test("shows the from date > to date error", async ({ page }) => {
    const fromDate = page.getByTestId("from-date");
    const toDate = page.getByTestId("to-date");
    const error = "The from date should be before the to date";

    expect(page.getByText(error)).not.toBeVisible();

    await fromDate.fill(DATE_MAX);
    await expect(fromDate).toHaveValue(DATE_MAX);
    await expect(page.getByText(error)).toBeVisible();

    await fromDate.fill(DATE_MIN);
    await expect(fromDate).toHaveValue(DATE_MIN);
    await expect(page.getByText(error)).not.toBeVisible();

    await toDate.fill(DATE_MIDDLE);
    await expect(toDate).toHaveValue(DATE_MIDDLE);

    await fromDate.fill(DATE_MIDDLE);
    await expect(fromDate).toHaveValue(DATE_MIDDLE);
    await expect(page.getByText(error)).toBeVisible();

    await fromDate.fill(DATE_MIDDLE_MINUS_ONE_DAY);
    await expect(fromDate).toHaveValue(DATE_MIDDLE_MINUS_ONE_DAY);
    await expect(page.getByText(error)).not.toBeVisible();

    await fromDate.fill(DATE_MIDDLE_PLUS_ONE_DAY);
    await expect(fromDate).toHaveValue(DATE_MIDDLE_PLUS_ONE_DAY);
    await expect(page.getByText(error)).toBeVisible();

    await fromDate.fill(DATE_MIN);
    await expect(fromDate).toHaveValue(DATE_MIN);
    await expect(page.getByText(error)).not.toBeVisible();
  });

  test("shows the to date < from date error", async ({ page }) => {
    const fromDate = page.getByTestId("from-date");
    const toDate = page.getByTestId("to-date");
    const error = "The to date should be after the from date";

    expect(page.getByText(error)).not.toBeVisible();

    await toDate.fill(DATE_MIN);
    await expect(toDate).toHaveValue(DATE_MIN);
    await expect(page.getByText(error)).toBeVisible();

    await toDate.fill(DATE_MAX);
    await expect(toDate).toHaveValue(DATE_MAX);
    await expect(page.getByText(error)).not.toBeVisible();

    await fromDate.fill(DATE_MIDDLE);
    await expect(fromDate).toHaveValue(DATE_MIDDLE);

    await toDate.fill(DATE_MIDDLE);
    await expect(toDate).toHaveValue(DATE_MIDDLE);
    await expect(page.getByText(error)).toBeVisible();

    await toDate.fill(DATE_MIDDLE_PLUS_ONE_DAY);
    await expect(toDate).toHaveValue(DATE_MIDDLE_PLUS_ONE_DAY);
    await expect(page.getByText(error)).not.toBeVisible();

    await toDate.fill(DATE_MIDDLE_MINUS_ONE_DAY);
    await expect(toDate).toHaveValue(DATE_MIDDLE_MINUS_ONE_DAY);
    await expect(page.getByText(error)).toBeVisible();

    await toDate.fill(DATE_MAX);
    await expect(toDate).toHaveValue(DATE_MAX);
    await expect(page.getByText(error)).not.toBeVisible();
  });
});
