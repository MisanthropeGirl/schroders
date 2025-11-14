import { chartPriceOptions } from "components/ChartOptions/ChartOptions";
import { DATE_MAX, DATE_MIN } from "../constants";
import * as selectors from "selectors";

const initialState: Store = {
  priceOption: chartPriceOptions[0],
  fromDate: DATE_MIN,
  toDate: DATE_MAX,
  selectedTickers: []
};

describe('Selector testing', () => {
  test('it should select the from date', () => {
    expect(selectors.selectFromDate(initialState)).toBe(DATE_MIN);
  });

  test('it should select the to date', () => {
    expect(selectors.selectToDate(initialState)).toBe(DATE_MAX);
  });

  test('it should select the chart price option', () => {
    expect(selectors.selectPriceOption(initialState)).toBe(chartPriceOptions[0]);
  });

  test('it should select the selected tickers', () => {
    const initialStateWithPopulatedSelectedTicker = {
      ...initialState,
      selectedTickers: ['SDR']
    };

    expect(selectors.selectSelectedTickers(initialState)).toEqual([]);
    expect(selectors.selectSelectedTickers(initialStateWithPopulatedSelectedTicker)).toEqual(['SDR']);
  });
});
