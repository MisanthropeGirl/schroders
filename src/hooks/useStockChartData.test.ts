import { renderHook, waitFor } from "@testing-library/react";
import { useLazyGetStockDataQuery } from "../app/apiSlice";
import { createInitialChartDataState, DATE_MAX, DATE_MIDDLE, DATE_MIN } from "../constants";
import {
  A_CHART_DATA,
  A_DATE_RANGE_CHART_DATA,
  stockDataApiOutput,
  stockDataApiOutputDateChanged,
} from "../mocks/Stocks";
import { useStockChartData } from "./useStockChartData";

jest.mock("../app/apiSlice");

describe("useStockChartData", () => {
  test("fetches and transforms data", async () => {
    const mockGetStockData = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValueOnce(stockDataApiOutput),
    });

    (useLazyGetStockDataQuery as jest.Mock).mockReturnValue([
      mockGetStockData,
      { isSuccess: true },
    ]);

    const onTickerUpdate = jest.fn();
    const { result } = renderHook(() =>
      useStockChartData(["A"], [], DATE_MIN, DATE_MAX, onTickerUpdate),
    );

    await waitFor(() => {
      expect(result.current.chartData).toEqual(A_CHART_DATA);
    });
  });

  test("fetches and transforms data when a date changes", async () => {
    const mockGetStockData = jest
      .fn()
      .mockReturnValueOnce({
        unwrap: jest.fn().mockResolvedValue(stockDataApiOutput),
      })
      .mockReturnValueOnce({
        unwrap: jest.fn().mockResolvedValue(stockDataApiOutputDateChanged),
      });

    (useLazyGetStockDataQuery as jest.Mock).mockReturnValue([
      mockGetStockData,
      { isSuccess: true },
    ]);

    const onTickerUpdate = jest.fn();
    const { result, rerender } = renderHook(
      ({ selectedStocks, chartTickers, fromDate, toDate }) =>
        useStockChartData(selectedStocks, chartTickers, fromDate, toDate, onTickerUpdate),
      {
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
    const mockGetStockData = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValueOnce(stockDataApiOutput),
    });

    (useLazyGetStockDataQuery as jest.Mock).mockReturnValue([
      mockGetStockData,
      { isSuccess: true },
    ]);

    const onTickerUpdate = jest.fn();
    const { result, rerender } = renderHook(
      ({ selectedStocks, chartTickers, fromDate, toDate }) =>
        useStockChartData(selectedStocks, chartTickers, fromDate, toDate, onTickerUpdate),
      {
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

  test("stores error message when rejection is an Error instance", async () => {
    const mockGetStockData = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(new Error("Network error")),
    });

    (useLazyGetStockDataQuery as jest.Mock).mockReturnValue([
      mockGetStockData,
      { isError: false, error: undefined },
    ]);

    const onTickerUpdate = jest.fn();
    const { result } = renderHook(() =>
      useStockChartData(["A"], [], DATE_MIN, DATE_MAX, onTickerUpdate),
    );

    await waitFor(() => {
      expect(result.current.fetchErrors["A"]).toBe("Network error");
    });
  });

  test("handles various non-Error types with generic message", async () => {
    const testCases = ["string error", 123, null, undefined, { message: "object error" }];

    for (const errorValue of testCases) {
      const mockGetStockData = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(errorValue),
      });

      (useLazyGetStockDataQuery as jest.Mock).mockReturnValue([
        mockGetStockData,
        { isError: false, error: undefined },
      ]);

      const onTickerUpdate = jest.fn();
      const { result } = renderHook(() =>
        useStockChartData(["A"], [], DATE_MIN, DATE_MAX, onTickerUpdate),
      );

      await waitFor(() => {
        expect(result.current.fetchErrors["A"]).toBe("Failed to fetch data");
      });
    }
  });
});
