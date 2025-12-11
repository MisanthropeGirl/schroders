import { PRICE_SERIES_CODES, createInitialChartDataState } from "../constants";
import { A, A_CHART_DATA } from "../mocks/Stocks";
import { dataTransform, removeTransformedDataByTicker } from ".";

describe("dataTransform", () => {
  test("it transforms the raw data in to that suitable for the chart", () => {
    expect(dataTransform(A, PRICE_SERIES_CODES.OPEN)).toStrictEqual(A_CHART_DATA["Open"][0].data);
    expect(dataTransform(A, PRICE_SERIES_CODES.HIGH)).toStrictEqual(A_CHART_DATA["High"][0].data);
    expect(dataTransform(A, PRICE_SERIES_CODES.LOW)).toStrictEqual(A_CHART_DATA["Low"][0].data);
    expect(dataTransform(A, PRICE_SERIES_CODES.CLOSE)).toStrictEqual(A_CHART_DATA["Close"][0].data);
  });

  test("it handles empty data array", () => {
    expect(dataTransform([], PRICE_SERIES_CODES.OPEN)).toEqual([]);
    expect(dataTransform([], PRICE_SERIES_CODES.HIGH)).toEqual([]);
    expect(dataTransform([], PRICE_SERIES_CODES.LOW)).toEqual([]);
    expect(dataTransform([], PRICE_SERIES_CODES.CLOSE)).toEqual([]);
  });

  test("it handles invalid price key", () => {
    const result = dataTransform(A, "invalid_key");
    expect(result[0][1]).toBeUndefined();
  });
});

describe("removeTransformedDataByTicker", () => {
  test("it removes ticker data from the transformed data object", () => {
    const initialState = A_CHART_DATA;
    const endState = createInitialChartDataState();

    removeTransformedDataByTicker(initialState, "A");
    expect(initialState).toStrictEqual(endState);
  });

  test("it should do nothing if there is no ticker", () => {
    const initialState = A_CHART_DATA;

    removeTransformedDataByTicker(initialState, "");
    expect(initialState).toStrictEqual(initialState);
  });
});
