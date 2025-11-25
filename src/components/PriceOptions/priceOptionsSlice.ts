import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { chartPriceOptions } from "../../constants";

export type ChartPriceOptions = typeof chartPriceOptions[number];

interface PriceOptionsState {
  priceOption: ChartPriceOptions;
}

const initialState: PriceOptionsState = {
  priceOption: chartPriceOptions[0] as ChartPriceOptions,
};

const priceOptionsSlice = createSlice({
  name: "price",
  initialState,
  reducers: {
    priceOptionUpdated: (state, action: PayloadAction<ChartPriceOptions>) => {
      state.priceOption = action.payload;
    },
  },
  selectors: {
    selectPriceOption: priceOptionsState => priceOptionsState.priceOption,
  }
});

export default priceOptionsSlice.reducer;
export const { priceOptionUpdated } = priceOptionsSlice.actions;
export const { selectPriceOption } = priceOptionsSlice.selectors;
