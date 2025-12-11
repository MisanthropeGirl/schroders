import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DATE_MIN, DATE_MAX } from "../../constants";

interface DateSelectorState {
  fromDate: string;
  toDate: string;
}

const initialState: DateSelectorState = {
  fromDate: DATE_MIN,
  toDate: DATE_MAX,
};

const dateSelectorSlice = createSlice({
  name: "dates",
  initialState,
  reducers: {
    datesUpdated: (state, action: PayloadAction<{ fromDate: string; toDate: string }>) => {
      state.fromDate = action.payload.fromDate;
      state.toDate = action.payload.toDate;
    },
  },
  selectors: {
    selectFromDate: optionsState => optionsState.fromDate,
    selectToDate: optionsState => optionsState.toDate,
  },
});

export default dateSelectorSlice.reducer;
export const { datesUpdated } = dateSelectorSlice.actions;
export const { selectFromDate, selectToDate } = dateSelectorSlice.selectors;
