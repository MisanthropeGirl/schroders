import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { createAppAsyncThunk } from "../../app/withTypes";
import { POLYGON_DATA_URL, PRICE_SERIES_CODES, chartPriceOptions, createInitialChartDataState } from "../../constants";
import { dataFetch, dataTransform, removeTransformedDataFromStateByTicker } from "../../utilities";
import { selectedStocksUpdated } from "../StockList/stockListSlice";

export const initialState: StockChartState = {
  tickers: [],
  data: createInitialChartDataState(),
  status: 'pending',
  error: null,
};

interface StockChartProps {
  ticker: string;
  from: string;
  to: string;
}  

export const fetchChartData = createAppAsyncThunk(
  'chart/fetchChartData',
  async (params: StockChartProps) => {
    const response = await dataFetch(
      `${POLYGON_DATA_URL}/${params.ticker}/range/1/day/${params.from}/${params.to}`,
        {
          adjusted: true,
          sort: 'asc',
        }
    );
    return { ticker: response.ticker, results: response.results };
  }
);

const stockChartSlice = createSlice({
  name: "chart",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchChartData.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        const data = action.payload.results;
        const ticker = action.payload.ticker;
        const existingTicker = new Set(state.tickers).has(ticker);

        state.status = 'succeeded';

        if (!existingTicker) {
          state.tickers.push(ticker);
        }

        // remove any existing data
        removeTransformedDataFromStateByTicker(state, ticker);

        // add new data
        chartPriceOptions.forEach(option => {
          state.data[option].push({
            'type': 'line',
            'name': ticker,
            'data': dataTransform(data, PRICE_SERIES_CODES[option.toUpperCase() as keyof typeof PRICE_SERIES_CODES])
          });
        })
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message ?? 'There was an error. Please refer to the console.';
      })
      .addCase(selectedStocksUpdated, (state, action: PayloadAction<string>) => {
        const ticker = action.payload;
        const existingTicker = new Set(state.tickers).has(ticker);

        if (existingTicker) {
          // removes data when a ticker is unselected
          state.tickers = state.tickers.filter(it => it !== ticker);
          removeTransformedDataFromStateByTicker(state, ticker);
        }

        // hide chart if data is empty
        if (Object.keys(state.tickers).length === 0) {
          state.status = 'pending';
        }
      });
  }
});

export default stockChartSlice.reducer;

export const selectChartData = (state: RootState) => state.chart.data;
export const selectChartTickers = (state: RootState) => state.chart.tickers;
export const selectChartStatus = (state: RootState) => state.chart.status
export const selectChartError = (state: RootState) => state.chart.error
