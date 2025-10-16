import { ACTION_TYPES } from "../constants";

export const setFromDate = (payload: string): { type: string; payload: string } => {
	console.info(`Dispatching ${ACTION_TYPES.SET_FROM_DATE}`);
	return {
		type: ACTION_TYPES.SET_FROM_DATE,
		payload,
	};
};

export const setToDate = (payload: string): { type: string; payload: string } => {
	console.info(`Dispatching ${ACTION_TYPES.SET_TO_DATE}`);
	return {
		type: ACTION_TYPES.SET_TO_DATE,
		payload,
	};
};

export const setChartPricingOption = (payload: ChartPriceOptions): { type: string; payload: ChartPriceOptions } => {
	console.info(`Dispatching ${ACTION_TYPES.SET_CHART_PRICING_OPTION}`);
	return {
		type: ACTION_TYPES.SET_CHART_PRICING_OPTION,
		payload,
	};
};

export const setNewTicker = (payload: string): { type: string; payload: string } => {
	console.info(`Dispatching ${ACTION_TYPES.SET_NEW_TICKER}`);
	return {
		type: ACTION_TYPES.SET_NEW_TICKER,
		payload,
	};
};

export const setRemovedTicker = (payload: string): { type: string; payload: string } => {
	console.info(`Dispatching ${ACTION_TYPES.SET_REMOVED_TICKER}`);
	return {
		type: ACTION_TYPES.SET_REMOVED_TICKER,
		payload,
	};
};

export const setSelectedTickers = (payload: string): { type: string; payload: string } => {
	console.info(`Dispatching ${ACTION_TYPES.SET_SELECTED_TICKERS}`);
	return {
		type: ACTION_TYPES.SET_SELECTED_TICKERS,
		payload,
	};
};
