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

// export const A_DATE_RANGE: StockData[] = A.slice(3, 6);

// const A_DATE_RANGE_RAW_CHART_DATA: RawChartData[] = [{
//   ticker: 'A',
//   data: A_DATE_RANGE
// }];

// export const A_DATE_RANGE_CHART_DATA: { [key: string]: ChartData[] } = {};
// A_DATE_RANGE_CHART_DATA['Open'] = dataTransform(A_DATE_RANGE_RAW_CHART_DATA, PRICE_SERIES_CODES.OPEN);
// A_DATE_RANGE_CHART_DATA['High'] = dataTransform(A_DATE_RANGE_RAW_CHART_DATA, PRICE_SERIES_CODES.HIGH);
// A_DATE_RANGE_CHART_DATA['Low'] = dataTransform(A_DATE_RANGE_RAW_CHART_DATA, PRICE_SERIES_CODES.LOW);
// A_DATE_RANGE_CHART_DATA['Close'] = dataTransform(A_DATE_RANGE_RAW_CHART_DATA, PRICE_SERIES_CODES.CLOSE);

export const AA: StockData[] = [
  {
      "v": 9.442581e+06,
      "vw": 24.8596,
      "o": 24,
      "c": 25.32,
      "h": 25.425,
      "l": 23.8501,
      "t": 1698638400000,
      "n": 69753
  },
  {
      "v": 5.156478e+06,
      "vw": 25.5835,
      "o": 25.28,
      "c": 25.64,
      "h": 25.89,
      "l": 24.84,
      "t": 1698724800000,
      "n": 43789
  },
  {
      "v": 6.202053e+06,
      "vw": 24.9568,
      "o": 25.67,
      "c": 25.03,
      "h": 25.78,
      "l": 24.275,
      "t": 1698811200000,
      "n": 46926
  },
  {
      "v": 5.825331e+06,
      "vw": 25.7923,
      "o": 25.5,
      "c": 26.07,
      "h": 26.142,
      "l": 25.295,
      "t": 1698897600000,
      "n": 44315
  },
  {
      "v": 5.479951e+06,
      "vw": 26.5314,
      "o": 26.5,
      "c": 26.53,
      "h": 27.005,
      "l": 26.14,
      "t": 1698984000000,
      "n": 46145
  },
  {
      "v": 3.869527e+06,
      "vw": 26.0804,
      "o": 26.71,
      "c": 25.97,
      "h": 26.73,
      "l": 25.76,
      "t": 1699246800000,
      "n": 32978
  },
  {
      "v": 4.852895e+06,
      "vw": 25.3437,
      "o": 25.22,
      "c": 25.54,
      "h": 25.595,
      "l": 24.82,
      "t": 1699333200000,
      "n": 37582
  },
  {
      "v": 3.671356e+06,
      "vw": 25.3451,
      "o": 25.12,
      "c": 25.53,
      "h": 25.66,
      "l": 24.965,
      "t": 1699419600000,
      "n": 30055
  },
  {
      "v": 4.078496e+06,
      "vw": 24.8878,
      "o": 25.81,
      "c": 24.58,
      "h": 25.87,
      "l": 24.41,
      "t": 1699506000000,
      "n": 32164
  },
  {
      "v": 3.040197e+06,
      "vw": 24.5455,
      "o": 24.7,
      "c": 24.64,
      "h": 24.8899,
      "l": 24.28,
      "t": 1699592400000,
      "n": 25987
  }
];
export const AA_RAW_CHART_DATA: RawChartData[] = [{
  ticker: 'AA',
  data: AA
}];

export const AA_CHART_DATA: { [key: string]: ChartData[] } = {};
AA_CHART_DATA['Open'] = dataTransform(AA_RAW_CHART_DATA, PRICE_SERIES_CODES.OPEN);
AA_CHART_DATA['High'] = dataTransform(AA_RAW_CHART_DATA, PRICE_SERIES_CODES.HIGH);
AA_CHART_DATA['Low'] = dataTransform(AA_RAW_CHART_DATA, PRICE_SERIES_CODES.LOW);
AA_CHART_DATA['Close'] = dataTransform(AA_RAW_CHART_DATA, PRICE_SERIES_CODES.CLOSE);

// export const AA_DATE_RANGE: StockData[] = AA.slice(3, 6);
