import { POLYGON_API_KEY, PRICE_SERIES_CODES } from "./../constants";

export const dataFetch = async (url: string, options: SearchParams) => {
  const params = convertObjectToString(options);
  const response = await fetch(`${url}?apiKey=${POLYGON_API_KEY}${params}`);
  if (!response.ok) {
    throw new Error(`HTTP error: Status ${response.status}`);
  }
  return await response.json();
};

export const convertObjectToString = (obj: object): string => {
  return Object.entries(obj).reduce((str, [key, val]) => {
    return `${str}&${key}=${val}`;
  }, "");
};

export const dataTransform = (data: RawChartData[], key: string): ChartData[] => {
  return data.map(stock => {
    return {
      type: "line",
      name: stock.ticker,
      data: stock.data.map(it => [
        it[PRICE_SERIES_CODES.TIME as keyof StockData] as number,
        it[key as keyof StockData] as number,
      ]),
    };
  });
};
