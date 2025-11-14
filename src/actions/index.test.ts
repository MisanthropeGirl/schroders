import { chartPriceOptions } from "components/ChartOptions/ChartOptions";
import { ACTION_TYPES } from "../constants";
import * as actions from "actions";

describe('Action testing',  () => {
  test('setFromDate', () => {
    const fromDate = '2025-01-01';
    const fromDateAction = actions.setFromDate(fromDate);
    expect(fromDateAction).toEqual({
      type: ACTION_TYPES.SET_FROM_DATE,
		  payload: fromDate,
    })
  })

  test('setToDate', () => {
    const toDate = '2025-12-31';
    const toDateAction = actions.setToDate(toDate);
    expect(toDateAction).toEqual({
      type: ACTION_TYPES.SET_TO_DATE,
		  payload: toDate,
    })
  })

  test('setChartPricingOption', () => {
    const chartPricingOption = chartPriceOptions[3];
    const chartPricingOptionAction = actions.setChartPricingOption(chartPricingOption);
    expect(chartPricingOptionAction).toEqual({
      type: ACTION_TYPES.SET_CHART_PRICING_OPTION,
		  payload: chartPricingOption,
    })
  })

  test('setSelectedTickers', () => {
    const selectedTickers = 'SDR';
    const selectedTickersAction = actions.setSelectedTickers(selectedTickers);
    expect(selectedTickersAction).toEqual({
      type: ACTION_TYPES.SET_SELECTED_TICKERS,
		  payload: selectedTickers,
    })
  })
});
