export const selectFromDate = (state: Store): string => state.fromDate;
export const selectToDate = (state: Store): string => state.toDate;
export const selectPriceOption = (state: Store): ChartPriceOptions => state.priceOption;
export const selectSelectedTickers = (state: Store): string[]  => state.selectedTickers;
