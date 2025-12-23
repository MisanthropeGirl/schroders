import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { dataFetch, dataTransform } from ".";
import { POLYGON_LIST_URL, PRICE_SERIES_CODES } from "../constants";
import { stockList } from "../mocks/StockList";
import { A_CHART_DATA, A_RAW_CHART_DATA } from "mocks/Stocks";

describe("dataFetch", () => {
  const mockedAxios = new AxiosMockAdapter(axios);

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("it handles successful API calls", async () => {
    mockedAxios.onGet(POLYGON_LIST_URL).replyOnce(200, stockList);

    // Make API call
    const data = await dataFetch(POLYGON_LIST_URL, {});

    // Verify results
    expect(data).toEqual(stockList);
  });

  test("it handles empty response body", async () => {
    mockedAxios.onGet(POLYGON_LIST_URL).replyOnce(200, null);

    const data = await dataFetch(POLYGON_LIST_URL, {});
    expect(data).toBeNull();
  });

  test("it handles unsuccessful API calls", async () => {
    mockedAxios.onGet(POLYGON_LIST_URL).replyOnce(404);

    await expect(dataFetch(POLYGON_LIST_URL, {})).rejects.toThrow("HTTP error: Status 404");
  });

  test("it handles API errors", async () => {
    mockedAxios.onGet(POLYGON_LIST_URL).networkErrorOnce();

    await expect(dataFetch(POLYGON_LIST_URL, {})).rejects.toThrow("Network Error");
  });

  test("it handles invalid JSON response", async () => {
    mockedAxios.onGet(POLYGON_LIST_URL).reply(_config => {
      return [200, "Invalid JSON"];
    });

    await expect(dataFetch(POLYGON_LIST_URL, {})).resolves.toBe("Invalid JSON");
  });

  // Need to bypass the mock axios adapter for this test and mock axios in Jest
  // since axios-mock-adapter cannot simulate this scenario
  test("it handles no response being received", async () => {
    mockedAxios.restore();

    const axiosSpy = jest.spyOn(axios, "get").mockRejectedValueOnce({
      request: "No response received",
      config: {},
    });

    await expect(dataFetch(POLYGON_LIST_URL, {})).rejects.toThrow("No response received");

    axiosSpy.mockRestore();
  });
});

describe("dataTransform", () => {
  test("it transforms the raw data in to that suitable for the chart", () => {
    expect(dataTransform(A_RAW_CHART_DATA, PRICE_SERIES_CODES.OPEN)).toStrictEqual(
      A_CHART_DATA["Open"],
    );
    expect(dataTransform(A_RAW_CHART_DATA, PRICE_SERIES_CODES.HIGH)).toStrictEqual(
      A_CHART_DATA["High"],
    );
    expect(dataTransform(A_RAW_CHART_DATA, PRICE_SERIES_CODES.LOW)).toStrictEqual(
      A_CHART_DATA["Low"],
    );
    expect(dataTransform(A_RAW_CHART_DATA, PRICE_SERIES_CODES.CLOSE)).toStrictEqual(
      A_CHART_DATA["Close"],
    );
  });

  test("it handles empty data array", () => {
    expect(dataTransform([], PRICE_SERIES_CODES.OPEN)).toEqual([]);
    expect(dataTransform([], PRICE_SERIES_CODES.HIGH)).toEqual([]);
    expect(dataTransform([], PRICE_SERIES_CODES.LOW)).toEqual([]);
    expect(dataTransform([], PRICE_SERIES_CODES.CLOSE)).toEqual([]);
  });

  test("it handles invalid price key", () => {
    const result = dataTransform(A_RAW_CHART_DATA, "invalid_key");

    // Should return data with undefined values or handle gracefully
    expect(result[0].data[0][1]).toBeUndefined();
  });
});
