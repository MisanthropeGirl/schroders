import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DATE_MIN, DATE_MAX } from "../../constants";
import { chartPriceOptions } from "./ChartOptions";

const initialState: ChartOptions = {
  priceOption: chartPriceOptions[0],
  fromDate: DATE_MIN,
  toDate: DATE_MAX,
};

const chartOptionsSlice = createSlice({
  name: "options",
  initialState,
  reducers: {
    datesUpdated: (state, action: PayloadAction<{fromDate: string, toDate: string}>) => {
      state.fromDate = action.payload.fromDate;
      state.toDate = action.payload.toDate;
    },
    priceOptionUpdated: (state, action: PayloadAction<ChartPriceOptions>) => {
      state.priceOption = action.payload;
    },
  },
  selectors: {
    selectFromDate: optionsState => optionsState.fromDate,
    selectToDate: optionsState => optionsState.toDate,
    selectPriceOption: optionsState => optionsState.priceOption,
  }
});

export default chartOptionsSlice.reducer;
export const { datesUpdated, priceOptionUpdated } = chartOptionsSlice.actions;
export const { selectFromDate, selectToDate, selectPriceOption } = chartOptionsSlice.selectors;
