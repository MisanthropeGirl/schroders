import { renderHook, waitFor } from "@testing-library/react";
import { rest } from "msw";
import {
  createInitialChartDataState,
  DATE_MAX,
  DATE_MIDDLE,
  DATE_MIN,
  POLYGON_DATA_URL,
} from "../constants";
import { server } from "../mocks/server";
import {
  A_CHART_DATA,
  A_DATE_RANGE_CHART_DATA,
  stockDataApiOutput,
  stockDataApiOutputDateChanged,
} from "../mocks/Stocks";
import { useStockChartData } from "./useStockChartData";
import { queryClientProviderWrapper } from "../test-utils";

describe("useStockChartData", () => {
  test("fetches and transforms data", async () => {
    const onTickerUpdate = jest.fn();
    const { result } = renderHook(
      () => useStockChartData(["A"], [], DATE_MIN, DATE_MAX, onTickerUpdate),
      { wrapper: queryClientProviderWrapper() },
    );

    await waitFor(() => {
      expect(result.current.chartData).toEqual(A_CHART_DATA);
    });
  });

  test("fetches and transforms data when a date changes", async () => {
    server.use(
      rest.get(`${POLYGON_DATA_URL}/A/range/1/day/${DATE_MIN}/${DATE_MAX}`, (req, res, ctx) => {
        return res.once(ctx.json(stockDataApiOutput));
      }),
      rest.get(`${POLYGON_DATA_URL}/A/range/1/day/${DATE_MIDDLE}/${DATE_MAX}`, (req, res, ctx) => {
        return res.once(ctx.json(stockDataApiOutputDateChanged));
      }),
    );

    const onTickerUpdate = jest.fn();
    const { result, rerender } = renderHook(
      ({ selectedStocks, chartTickers, fromDate, toDate }) =>
        useStockChartData(selectedStocks, chartTickers, fromDate, toDate, onTickerUpdate),
      {
        wrapper: queryClientProviderWrapper(),
        initialProps: {
          selectedStocks: ["A"],
          chartTickers: [] as string[],
          fromDate: DATE_MIN,
          toDate: DATE_MAX,
        },
      },
    );

    await waitFor(() => {
      expect(result.current.chartData).toEqual(A_CHART_DATA);
    });

    // Rerender with new dates to trigger the date change effect
    rerender({
      selectedStocks: ["A"],
      chartTickers: ["A"],
      fromDate: DATE_MIDDLE,
      toDate: DATE_MAX,
    });

    await waitFor(() => {
      expect(result.current.chartData).toEqual(A_DATE_RANGE_CHART_DATA);
    });
  });

  test("Removes data", async () => {
    const onTickerUpdate = jest.fn();
    const { result, rerender } = renderHook(
      ({ selectedStocks, chartTickers, fromDate, toDate }) =>
        useStockChartData(selectedStocks, chartTickers, fromDate, toDate, onTickerUpdate),
      {
        wrapper: queryClientProviderWrapper(),
        initialProps: {
          selectedStocks: ["A"],
          chartTickers: [] as string[],
          fromDate: DATE_MIN,
          toDate: DATE_MAX,
        },
      },
    );

    await waitFor(() => {
      expect(result.current.chartData).toEqual(A_CHART_DATA);
    });

    // Rerender with new dates to trigger the date change effect
    rerender({
      selectedStocks: [],
      chartTickers: ["A"],
      fromDate: DATE_MIN,
      toDate: DATE_MAX,
    });

    await waitFor(() => {
      expect(result.current.chartData).toEqual(createInitialChartDataState());
    });
  });

  test("it handles server error (4xx/5xx)", async () => {
    server.use(
      rest.get(`${POLYGON_DATA_URL}/A/range/1/day/:from/:to`, (_req, res, ctx) => {
        return res.once(ctx.status(500));
      }),
    );

    const onTickerUpdate = jest.fn();
    const { result } = renderHook(
      () => useStockChartData(["A"], [], DATE_MIN, DATE_MAX, onTickerUpdate),
      { wrapper: queryClientProviderWrapper() },
    );

    await waitFor(() => {
      expect(result.current.fetchErrors["A"]).toBe("HTTP error: Status 500");
    });
  });

  test("it handles network error (no response)", async () => {
    server.use(
      rest.get(`${POLYGON_DATA_URL}/A/range/1/day/:from/:to`, (_req, res) => {
        return res.networkError("Connection failed");
      }),
    );

    const onTickerUpdate = jest.fn();
    const { result } = renderHook(
      () => useStockChartData(["A"], [], DATE_MIN, DATE_MAX, onTickerUpdate),
      { wrapper: queryClientProviderWrapper() },
    );

    await waitFor(() => {
      expect(result.current.fetchErrors["A"]).toBe("Network error: No response received");
    });
  });

  test("it handles axios setup error", async () => {
    const axiosGetSpy = jest.spyOn(require("axios"), "get");

    axiosGetSpy.mockRejectedValueOnce({
      message: "Invalid configuration",
    });

    const onTickerUpdate = jest.fn();
    const { result } = renderHook(
      () => useStockChartData(["A"], [], DATE_MIN, DATE_MAX, onTickerUpdate),
      { wrapper: queryClientProviderWrapper() },
    );

    await waitFor(() => {
      expect(result.current.fetchErrors["A"]).toBe("Request failed: Invalid configuration");
    });

    axiosGetSpy.mockRestore();
  });
});
