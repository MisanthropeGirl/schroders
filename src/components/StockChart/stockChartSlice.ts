import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

interface StockChartState {
  tickers: string[];
}

const initialState: StockChartState = {
  tickers: [],
};

export interface StockChartProps {
  ticker: string;
  from: string;
  to: string;
}

const stockChartSlice = createSlice({
  name: "chart",
  initialState,
  reducers: {
    tickersUpdated: (state, action: PayloadAction<string>) => {
      if (state.tickers.includes(action.payload)) {
        state.tickers = state.tickers.filter(it => it !== action.payload);
      } else {
        state.tickers.push(action.payload);
      }
    },
  },
});

export default stockChartSlice.reducer;

export const { tickersUpdated } = stockChartSlice.actions;

export const selectChartTickers = (state: RootState) => state.chart.tickers;
