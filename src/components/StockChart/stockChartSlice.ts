import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { createAppAsyncThunk } from "../../app/withTypes";
import { POLYGON_DATA_URL } from "../../constants";
import { dataFetch } from "../../utilities";
import { selectedStocksUpdated } from "../StockList/stockListSlice";

interface StockChartState {
  data: RawChartData[];
  status: Status;
  error: string | null;
}

interface StockChartProps {
  ticker: string;
  from: string;
  to: string;
}

export const initialState: StockChartState = {
  data: [],
  status: 'pending',
  error: null,
};

export const fetchChartData = createAppAsyncThunk(
  'chart/fetchChartData',
  async (params: StockChartProps) => {
    const response = await await dataFetch(
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
        state.status = 'succeeded';

        const tickerIndex = state.data.findIndex(it => it.ticker === action.payload.ticker);
        if (tickerIndex > -1) {
          state.data[tickerIndex].data = action.payload.results;
        } else {
          state.data.push({ ticker: action.payload.ticker, data: action.payload.results });
        }
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message ?? 'There was an error. Please refer to the console.';
      })
      .addCase(selectedStocksUpdated, (state, action: PayloadAction<string>) => {
        // removes data when a ticker is unselected
        const tickerIndex = state.data.findIndex(it => it.ticker === action.payload);
        if (tickerIndex > -1) {
          state.data = state.data.filter(d => d.ticker !== action.payload);
        }

        // hide chart if data is empty
        if (state.data.length === 0) {
          state.status = 'pending';  
        }
      });
  }
});

export default stockChartSlice.reducer;

export const selectChartData = (state: RootState) => state.chart.data;
export const selectChartStatus = (state: RootState) => state.chart.status
export const selectChartError = (state: RootState) => state.chart.error
