import axios from "axios";
import { POLYGON_API_KEY, PRICE_SERIES_CODES } from "./../constants";

export const dataFetch = async (url: string, options: SearchParams) => {
  try {
    const response = await axios.get(url, {
      params: {
        apiKey: POLYGON_API_KEY,
        ...options,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(`HTTP error: Status ${error.response.status}`);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      throw new Error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message);
    }
  }
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
