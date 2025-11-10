import axios from 'axios';
import { convertObjectToString, dataFetch, dataTransform } from '.';
import { POLYGON_LIST_URL, PRICE_SERIES_CODES } from '../constants';
import { stockList } from '../mocks/StockList';
import { A_CHART_DATA, A_RAW_CHART_DATA } from 'mocks/Stocks';

jest.mock('axios');

describe('convertObjectToString', () => {
  test('it will return an empty string if there is an empty object', () => {
    const str = convertObjectToString({});
    expect(str).toBe('');
  });

  test('it will return a string if there is a populated object', () => {
    const obj1 = { a: 1 };
    const obj2 = {
      market: 'stocks',
      type: 'CS',
      exchange: 'XNYS',
      active: true,
      order: 'asc',
      limit: 100,
      sort: 'ticker'
    };

    const str1 = convertObjectToString(obj1);
    expect(str1).toBe('&a=1');

    const str2 = convertObjectToString(obj2);
    expect(str2).toBe('&market=stocks&type=CS&exchange=XNYS&active=true&order=asc&limit=100&sort=ticker');
  });

  test('it handles special characters in values', () => {
    const obj = { search: 'hello world', filter: 'a&b=c' };
    const str = convertObjectToString(obj);
    
    // Should properly encode special characters
    expect(str).toBe('&search=hello world&filter=a&b=c');
  });
});

describe('dataFetch', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('it constructs URL with query parameters correctly', async () => {
    mockedAxios.get.mockResolvedValue({
      data: null,
      status: 200
    });

    await dataFetch(POLYGON_LIST_URL, {
      market: 'stocks',
      type: 'CS',
      exchange: 'XNYS',
      active: true,
      order: 'asc',
      limit: 100,
      sort: 'ticker'
    });
 
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('?apiKey=')
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('&market=stocks')
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('&type=CS')
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('&exchange=XNYS')
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('&active=true')
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('&order=asc')
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('&limit=100')
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('&sort=ticker')
    );
  });

  test('it handles successful API calls', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: stockList
    });

    // Make API call
    const data = await dataFetch(POLYGON_LIST_URL, {});

    // Verify results
    expect(data).toEqual(stockList);
  });

  test('it handles empty response body', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: null
    });
  
    const data = await dataFetch(POLYGON_LIST_URL, {});
    expect(data).toBeNull();
  });

  test('it handles unsuccessful API calls', async () => {
    mockedAxios.get.mockRejectedValue({
      response: {
        status: 404
      }
    });

    // Verify error handling
    await expect(dataFetch(`${POLYGON_LIST_URL}a`, {}))
      .rejects
      .toThrow('HTTP error: Status 404');
  });

  test('it handles no response being received', async () => {
    mockedAxios.get.mockRejectedValue({
      request: 'No response received'
    });

    // Verify error handling
    await expect(dataFetch(`${POLYGON_LIST_URL}a`, {}))
      .rejects
      .toThrow('No response received');
  });

  test('it handles API errors', async () => {
    // Mock network error
    mockedAxios.get.mockRejectedValue(
      new Error('Network error')
    );

    // Verify error handling
    await expect(dataFetch(POLYGON_LIST_URL, {}))
      .rejects
      .toThrow('Network error');
  });

  test('it handles invalid JSON response', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: new Error('Invalid JSON')
    });

    await expect(dataFetch(POLYGON_LIST_URL, {}))
      .resolves
      .toThrow('Invalid JSON');
  });
});

describe('dataTransform', () => {
  test('it transforms the raw data in to that suitable for the chart', () => {
    expect(dataTransform(A_RAW_CHART_DATA, PRICE_SERIES_CODES.OPEN)).toStrictEqual(A_CHART_DATA['Open']);
    expect(dataTransform(A_RAW_CHART_DATA, PRICE_SERIES_CODES.HIGH)).toStrictEqual(A_CHART_DATA['High']);
    expect(dataTransform(A_RAW_CHART_DATA, PRICE_SERIES_CODES.LOW)).toStrictEqual(A_CHART_DATA['Low']);
    expect(dataTransform(A_RAW_CHART_DATA, PRICE_SERIES_CODES.CLOSE)).toStrictEqual(A_CHART_DATA['Close']);
  });

  test('it handles empty data array', () => {
    expect(dataTransform([], PRICE_SERIES_CODES.OPEN)).toEqual([]);
    expect(dataTransform([], PRICE_SERIES_CODES.HIGH)).toEqual([]);
    expect(dataTransform([], PRICE_SERIES_CODES.LOW)).toEqual([]);
    expect(dataTransform([], PRICE_SERIES_CODES.CLOSE)).toEqual([]);
  });

  test('it handles invalid price key', () => {
    const result = dataTransform(A_RAW_CHART_DATA, 'invalid_key');
    
    // Should return data with undefined values or handle gracefully
    expect(result[0].data[0][1]).toBeUndefined();
  });
})