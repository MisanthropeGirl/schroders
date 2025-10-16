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
  test('it should handle undefined state gracefully', () => {
    expect(selectors.selectNewTicker(initialState)).toBeUndefined();
    expect(selectors.selectNewTicker(undefined as any)).toBeUndefined();
    expect(selectors.selectRemovedTicker(initialState)).toBeUndefined();
    expect(selectors.selectRemovedTicker(undefined as any)).toBeUndefined();
  });

  test('it should handle null state gracefully', () => {
    expect(selectors.selectNewTicker(null as any)).toBeUndefined();
    expect(selectors.selectRemovedTicker(null as any)).toBeUndefined();
  });

  test('it should select the from date', () => {
    expect(selectors.selectFromDate(initialState)).toBe(DATE_MIN);
  });

  test('it should select the to date', () => {
    expect(selectors.selectToDate(initialState)).toBe(DATE_MAX);
  });

  test('it should select the chart price option', () => {
    expect(selectors.selectPriceOption(initialState)).toBe(chartPriceOptions[0]);
  });

  test('it should select the new ticker', () => {
    const newTicker = 'SDR';
    const initialStateWithNewTicker: Store = {
      ...initialState,
      newTicker
    }
    expect(selectors.selectNewTicker(initialStateWithNewTicker)).toBe(newTicker);
  });

  test('it should select the removed ticker', () => {
    const removedTicker = 'SDR';
    const initialStateWithRemovedTicker: Store = {
      ...initialState,
      removedTicker
    }
    expect(selectors.selectRemovedTicker(initialStateWithRemovedTicker)).toBe(removedTicker);
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
