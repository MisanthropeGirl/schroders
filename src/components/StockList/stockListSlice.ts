import { EntityState, PayloadAction, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { createAppAsyncThunk } from "../../app/withTypes";
import { POLYGON_LIST_URL } from "../../constants";
import { dataFetch } from "../../utilities";

interface StockListState extends EntityState<StockWithId, string> {
  selectedStocks: string[];
  status: Status;
  error: string | null;
}

const stocklistAdapter = createEntityAdapter<StockWithId>();

export const initialState: StockListState = stocklistAdapter.getInitialState({
  selectedStocks: [],
  status: 'idle',
  error: null,
});

export const fetchStocks = createAppAsyncThunk(
  'stocks/fetchStocks',
  async () => {
    const response = await dataFetch(
      POLYGON_LIST_URL,
      {
        market: 'stocks',
        type: 'CS',
        exchange: 'XNYS',
        active: true,
        order: 'asc',
        limit: 100,
        sort: 'ticker'
      }
    );
    return response.results;
  },
  {
    condition(_arg, thunkApi) {
      const status = selectStocksStatus(thunkApi.getState())
      if (status !== 'idle') {
        return false;
      }
    }
  }
);

const stockListSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {
    selectedStocksUpdated: (state, action: PayloadAction<string>) => {
      if (state.selectedStocks.includes(action.payload)) {
        state.selectedStocks = state.selectedStocks.filter(it => it !== action.payload)
      } else {
        state.selectedStocks.push(action.payload);
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchStocks.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const stocksWithId = (action.payload || []).map((it: Stock) => {
          return {...it, id: it.ticker}
        });
        stocklistAdapter.setAll(state, stocksWithId);
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message ?? 'There was an error. Please refer to the console.';
      });
  }
});

export default stockListSlice.reducer;
export const { selectedStocksUpdated } = stockListSlice.actions;

export const {
  selectAll: selectAllStocks,
  selectById: selectStockById,
  selectIds: selectStockIds,
} = stocklistAdapter.getSelectors((state: RootState) => state.stocks);

export const selectStocksSelected = (state: RootState) => state.stocks.selectedStocks;
export const selectStocksStatus = (state: RootState) => state.stocks.status
export const selectStocksError = (state: RootState) => state.stocks.error
