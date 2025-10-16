import { chartPriceOptions } from "components/ChartOptions/ChartOptions";
import { ACTION_TYPES, DATE_MAX, DATE_MIN } from "../constants";
import reducer from "reducers"

const initialTestState: Store = {
  priceOption: chartPriceOptions[0],
  fromDate: DATE_MIN,
  toDate: DATE_MAX,
  selectedTickers: []
};

describe('Reducer testing', () => {
  test('it will update from date', () => {
    const fromDate = '2025-01-01';
    const action = {
      type: ACTION_TYPES.SET_FROM_DATE,
		  payload: fromDate,
    };

    expect(reducer(initialTestState, action)).toEqual({
      ...initialTestState,
      fromDate,
    });
  });

  test('it will update to date', () => {
    const toDate = '2025-12-31';
    const action = {
      type: ACTION_TYPES.SET_TO_DATE,
		  payload: toDate,
    };

    expect(reducer(initialTestState, action)).toEqual({
      ...initialTestState,
      toDate,
    });
  });

  test('it will update chart pricing option', () => {
    const priceOption = chartPriceOptions[2];
    const action = {
      type: ACTION_TYPES.SET_CHART_PRICING_OPTION,
		  payload: priceOption,
    };

    expect(reducer(initialTestState, action)).toEqual({
      ...initialTestState,
      priceOption,
    });
  });

  test('it will update new ticker', () => {
    const newTicker = 'SDR';
    const action = {
      type: ACTION_TYPES.SET_NEW_TICKER,
		  payload: newTicker,
    };

    expect(reducer(initialTestState, action)).toEqual({
      ...initialTestState,
      newTicker,
    });
  });

  test('it will update removed ticker', () => {
    const removedTicker = 'SDR';
    const action = {
      type: ACTION_TYPES.SET_REMOVED_TICKER,
		  payload: removedTicker,
    };

    expect(reducer(initialTestState, action)).toEqual({
      ...initialTestState,
      removedTicker,
    });
  });

  test('it will add a ticker to selected tickers', () => {
    const ticker = 'SDR';
    const action = {
      type: ACTION_TYPES.SET_SELECTED_TICKERS,
		  payload: ticker,
    };

    expect(reducer(initialTestState, action)).toEqual({
      ...initialTestState,
      selectedTickers: ['SDR'],
    })
  });

  test('it will remove a ticker from selected tickers', () => {
    const initialTestStateWithTicker: Store = {
      ...initialTestState,
      selectedTickers: ['SDR']
    }
    const ticker = 'SDR';
    const action = {
      type: ACTION_TYPES.SET_SELECTED_TICKERS,
		  payload: ticker,
    };

    expect(reducer(initialTestStateWithTicker, action)).toEqual({
      ...initialTestState,
      selectedTickers: [],
    })
  });

  test('it will add then remove a duplicate ticker', () => {
    const ticker = 'SDR';
    const action = {
      type: ACTION_TYPES.SET_SELECTED_TICKERS,
		  payload: ticker,
    };

    const intermediateState = reducer(initialTestState, action);

    expect(reducer(initialTestState, action)).toEqual(intermediateState);
    expect(reducer(intermediateState, action)).toEqual(initialTestState);
  })

  test('it returns initial state for an unknown action', () => {
    const action = {
      type: 'UNKNOWN_ACTION',
      payload: 'test'
    };

    expect(reducer(initialTestState, action)).toEqual(initialTestState);
  });

  test('it returns initialTestState when state is undefined', () => {
    const action = { type: '@@INIT' };
    expect(reducer(undefined, action)).toStrictEqual(initialTestState);
  });
});
