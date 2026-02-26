import { PRICE_SERIES_CODES, createInitialChartDataState } from "../constants";
import { A, A_CHART_DATA } from "../mocks/Stocks";
import { convertObjectToString, dataTransform, removeTransformedDataByTicker } from ".";

describe("convertObjectToString", () => {
  test("it will return an empty string if there is an empty object", () => {
    const str = convertObjectToString({});
    expect(str).toBe("");
  });

  test("it will return a string if there is a populated object", () => {
    const obj1 = { a: 1 };
    const obj2 = {
      market: "stocks",
      type: "CS",
      exchange: "XNYS",
      active: true,
      order: "asc",
      limit: 100,
      sort: "ticker",
    };

    const str1 = convertObjectToString(obj1);
    expect(str1).toBe("&a=1");

    const str2 = convertObjectToString(obj2);
    expect(str2).toBe(
      "&market=stocks&type=CS&exchange=XNYS&active=true&order=asc&limit=100&sort=ticker",
    );
  });

  test("it handles special characters in values", () => {
    const obj = { search: "hello world", filter: "a&b=c" };
    const str = convertObjectToString(obj);

    // Should properly encode special characters
    expect(str).toBe("&search=hello world&filter=a&b=c");
  });
});

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
