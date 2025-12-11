import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

interface StockListState {
  selectedStocks: string[];
}

export const initialState: StockListState = {
  selectedStocks: [],
};

const stockListSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {
    selectedStocksUpdated: (state, action: PayloadAction<string>) => {
      if (state.selectedStocks.includes(action.payload)) {
        state.selectedStocks = state.selectedStocks.filter(it => it !== action.payload);
      } else {
        state.selectedStocks.push(action.payload);
      }
    },
  },
});

export default stockListSlice.reducer;

export const { selectedStocksUpdated } = stockListSlice.actions;

export const selectStocksSelected = (state: RootState) => state.stocks.selectedStocks;
