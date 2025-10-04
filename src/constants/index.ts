import { format, subYears } from 'date-fns';

export const POLYGON_API_KEY = 'DY4QGIRlzXYpIr5ifqrJem6mFB5RVsgq';
export const POLYGON_LIST_URL = 'https://api.polygon.io/v3/reference/tickers';
export const POLYGON_DATA_URL = 'https://api.polygon.io/v2/aggs/ticker';

export const PRICE_SERIES_CODES = {
  CLOSE: 'c',
  HIGH: 'h',
  LOW: 'c',
  OPEN: 'o',
  TIME: 't',
};

export const ACTION_TYPES = {
  SET_FROM_DATE: 'SET_FROM_DATE',
  SET_TO_DATE: 'SET_TO_DATE',
  SET_CHART_PRICING_OPTION: 'SET_CHART_PRICING_OPTION',
  SET_NEW_TICKER: 'SET_NEW_TICKER',
  SET_REMOVED_TICKER: 'SET_REMOVED_TICKER',
  SET_SELECTED_TICKERS: 'SET_SELECTED_TICKERS',
};

// only have access to the last two years
export const DATE_MAX = format(new Date(), 'yyyy-MM-dd');
export const DATE_MIN = format(subYears(DATE_MAX, 2), 'yyyy-MM-dd');

