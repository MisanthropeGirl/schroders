import { convertObjectToString, dataFetch } from '.';
import { POLYGON_LIST_URL } from '../constants';
import { stockList } from '../mocks';

describe('convertObjectToString', () => {
  test('it will return an empty string if there is an empty object', () => {
    const str = convertObjectToString({});
    expect(str).toBe('');
  });

  test('it will return a string if there is a populated object', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 1, b: 2 };

    const str1 = convertObjectToString(obj1);
    expect(str1).toBe('&a=1');

    const str2 = convertObjectToString(obj2);
    expect(str2).toBe('&a=1&b=2');
  });
});

describe('dataFetch', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("it handles successful API calls", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(stockList)
    });

    // Make API call
    const data = await dataFetch(POLYGON_LIST_URL, {});

    // Verify results
    expect(data).toEqual(stockList);
  });

  test("it handles unsuccessful API calls", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404
    });

    // Verify error handling
    await expect(dataFetch(`${POLYGON_LIST_URL}a`, {}))
      .rejects
      .toThrow("HTTP error: Status 404");
  });

  test("it handles API errors", async () => {
    // Mock network error
    global.fetch = jest.fn().mockRejectedValue(
      new Error("Network error")
    );

    // Verify error handling
    await expect(dataFetch(POLYGON_LIST_URL, {}))
      .rejects
      .toThrow("Network error");
  });

  test("it handles invalid JSON response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error("Invalid JSON"))
    });

    await expect(dataFetch(POLYGON_LIST_URL, {}))
      .rejects
      .toThrow("Invalid JSON");
  });
});
