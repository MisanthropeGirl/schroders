import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { POLYGON_API_KEY } from "../constants";
import { StockChartProps } from "components/StockChart/stockChartSlice";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.polygon.io/" }),
  keepUnusedDataFor: 3600, // one hour
  endpoints: builder => ({
    getStockList: builder.query<StockListApiResponse, string>({
      query: url => ({
        url,
        params: {
          apiKey: POLYGON_API_KEY,
          market: "stocks",
          type: "CS",
          exchange: "XNYS",
          active: true,
          order: "asc",
          limit: 100,
          sort: "ticker",
        },
      }),
    }),
    getStockData: builder.query<StockDataApiResponse, StockChartProps>({
      query: params => ({
        url: `/v2/aggs/ticker/${params.ticker}/range/1/day/${params.from}/${params.to}`,
        params: {
          apiKey: POLYGON_API_KEY,
          adjusted: true,
          sort: "asc",
        },
      }),
    }),
  }),
});

export const { useGetStockListQuery, useLazyGetStockDataQuery, usePrefetch } = apiSlice;
