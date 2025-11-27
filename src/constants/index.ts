import { format, subYears } from 'date-fns';

export const POLYGON_API_KEY = 'DY4QGIRlzXYpIr5ifqrJem6mFB5RVsgq';
export const POLYGON_LIST_URL = 'https://api.polygon.io/v3/reference/tickers';
export const POLYGON_DATA_URL = 'https://api.polygon.io/v2/aggs/ticker';

export const chartPriceOptions = ['Close', 'High', 'Low', 'Open'] as const;
export const createInitialChartDataState = (): Record<string, TransformedData[]> => ({ 'Open' : [], 'High': [], 'Low': [], 'Close': [] });
export const PRICE_SERIES_CODES: Record<string, string> = {
  CLOSE: 'c',
  HIGH: 'h',
  LOW: 'l',
  OPEN: 'o',
  TIME: 't',
} as const;

// only have access to the last two years
export const DATE_MAX = format(new Date(), 'yyyy-MM-dd');
export const DATE_MIDDLE = format(subYears(DATE_MAX, 1), 'yyyy-MM-dd');
export const DATE_MIN = format(subYears(DATE_MAX, 2), 'yyyy-MM-dd');

