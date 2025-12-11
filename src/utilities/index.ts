import { PRICE_SERIES_CODES, chartPriceOptions } from "./../constants";

export const dataTransform = (data: StockData[], key: string): TransformedChartData => {
  return data.map(it => [
    it[PRICE_SERIES_CODES.TIME as keyof StockData] as number,
    it[key as keyof StockData] as number,
  ]);
};

export const removeTransformedDataByTicker = (
  data: Record<string, TransformedData[]>,
  ticker: string,
) => {
  chartPriceOptions.forEach(option => {
    data[option] = data[option].filter(d => d.name !== ticker);
  });
};
