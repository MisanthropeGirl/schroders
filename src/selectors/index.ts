export const selectFromDate = (state: Store): string => state?.fromDate;
export const selectToDate = (state: Store): string => state?.toDate;
export const selectPriceOption = (state: Store): ChartPriceOptions => state?.priceOption;
export const selectNewTicker = (state: Store): string | undefined  => state?.newTicker;
export const selectRemovedTicker = (state: Store): string | undefined  => state?.removedTicker;
export const selectSelectedTickers = (state: Store): string[]  => state?.selectedTickers;
