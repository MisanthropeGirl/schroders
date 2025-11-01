import { PRICE_SERIES_CODES } from "../constants";
import { dataTransform } from "../utilities";

export const A: StockData[] = [
  {
    "v": 3.684907e+06,
    "vw": 99.7346,
    "o": 102.71,
    "c": 101.17,
    "h": 102.78,
    "l": 96.8,
    "t": 1698638400000,
    "n": 56252
  },
  {
    "v": 2.218807e+06,
    "vw": 103.0837,
    "o": 103,
    "c": 103.37,
    "h": 104.2,
    "l": 101.94,
    "t": 1698724800000,
    "n": 36846
  },
  {
    "v": 2.284563e+06,
    "vw": 101.9901,
    "o": 102.5,
    "c": 102.86,
    "h": 103.21,
    "l": 100.26,
    "t": 1698811200000,
    "n": 36723
  },
  {
    "v": 1.488985e+06,
    "vw": 104.099,
    "o": 103.97,
    "c": 104.47,
    "h": 104.635,
    "l": 102.7,
    "t": 1698897600000,
    "n": 33079
  },
  {
    "v": 2.511311e+06,
    "vw": 108.5188,
    "o": 106.5,
    "c": 109.02,
    "h": 109.59,
    "l": 106.1201,
    "t": 1698984000000,
    "n": 45020
  },
  {
    "v": 1.411996e+06,
    "vw": 107.9981,
    "o": 108.81,
    "c": 107.53,
    "h": 109.52,
    "l": 107.17,
    "t": 1699246800000,
    "n": 28268
  },
  {
    "v": 2.142253e+06,
    "vw": 110.1228,
    "o": 106.84,
    "c": 110.54,
    "h": 110.81,
    "l": 106.545,
    "t": 1699333200000,
    "n": 34982
  },
  {
    "v": 1.494951e+06,
    "vw": 109.57,
    "o": 110.89,
    "c": 109.39,
    "h": 111.57,
    "l": 108.46,
    "t": 1699419600000,
    "n": 29626
  },
  {
    "v": 1.481269e+06,
    "vw": 108.2426,
    "o": 110.12,
    "c": 107.74,
    "h": 110.12,
    "l": 107.54,
    "t": 1699506000000,
    "n": 24879
  },
  {
    "v": 1.847851e+06,
    "vw": 107.2351,
    "o": 107.72,
    "c": 108.47,
    "h": 108.48,
    "l": 104.09,
    "t": 1699592400000,
    "n": 30876
  }
];

export const A_RAW_CHART_DATA: RawChartData[] = [{
  ticker: 'A',
  data: A
}];

export const A_CHART_DATA: { [key: string]: ChartData[] } = {};
A_CHART_DATA['Open'] = dataTransform(A_RAW_CHART_DATA, PRICE_SERIES_CODES.OPEN);
A_CHART_DATA['High'] = dataTransform(A_RAW_CHART_DATA, PRICE_SERIES_CODES.HIGH);
A_CHART_DATA['Low'] = dataTransform(A_RAW_CHART_DATA, PRICE_SERIES_CODES.LOW);
A_CHART_DATA['Close'] = dataTransform(A_RAW_CHART_DATA, PRICE_SERIES_CODES.CLOSE);

export const A_DATE_RANGE: StockData[] = A.slice(3, 6);

const A_DATE_RANGE_RAW_CHART_DATA: RawChartData[] = [{
  ticker: 'A',
  data: A_DATE_RANGE
}];

export const A_DATE_RANGE_CHART_DATA: { [key: string]: ChartData[] } = {};
A_DATE_RANGE_CHART_DATA['Open'] = dataTransform(A_DATE_RANGE_RAW_CHART_DATA, PRICE_SERIES_CODES.OPEN);
A_DATE_RANGE_CHART_DATA['High'] = dataTransform(A_DATE_RANGE_RAW_CHART_DATA, PRICE_SERIES_CODES.HIGH);
A_DATE_RANGE_CHART_DATA['Low'] = dataTransform(A_DATE_RANGE_RAW_CHART_DATA, PRICE_SERIES_CODES.LOW);
A_DATE_RANGE_CHART_DATA['Close'] = dataTransform(A_DATE_RANGE_RAW_CHART_DATA, PRICE_SERIES_CODES.CLOSE);

export const AA: StockData[] = A;
export const AAM: StockData[] = A;
