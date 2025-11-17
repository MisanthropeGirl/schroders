import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState: StockList = {
  selectedTickers: [],
}

const stockListSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {
    selectedTickersUpdated: (state, action: PayloadAction<string>) => {
      if (state.selectedTickers.includes(action.payload)) {
        state.selectedTickers.filter(it => it !== action.payload)
      } else {
        state.selectedTickers.push(action.payload);
      }
    }
  },
  selectors: {
    selectSelectedTickers: stocksState => stocksState.selectedTickers,
  }
});

export default stockListSlice.reducer;
export const { selectedTickersUpdated } = stockListSlice.actions;
export const { selectSelectedTickers } = stockListSlice.selectors;
