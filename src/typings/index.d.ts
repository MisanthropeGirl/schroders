interface ApiResult {
  next_url: string;
  request_id: string;
  status: string;
}

interface StockDataApiResult extends ApiResult {
  adjusted: boolean;
  queryCount: number;
  request_id: string;
  results: StockData[];
  resultsCount: number;
  ticker: string;
}

interface StockListApiResult extends ApiResult {
  count: number;
  results: Stock[] | null;
}

interface Stock {
  active?: boolean;
  cik?: string;
  composite_figi?: string;
  currency_name?: string;
  delisted_utc?: string;
  last_updated_utc?: string;
  locale: "us" | "global";
  market: "stocks" | "crypto" | "fx" | "otc" | "indices";
  name: string;
  primary_exchange?: string;
  share_class_figi?: string;
  ticker: string;
  type?: string;
}

interface StockData {
  c: number;
  h: number;
  l: number;
  n?: number;
  o: number;
  otc?: boolean;
  t: number;
  v: number;
  vw?: number;
}

interface RawChartData {
  ticker: string;
  data: StockData[];
}

interface ChartData {
  name: string;
  type: string;
  data: [number, number][];
}

interface SearchParams {
  active?: boolean;
  adjusted?: boolean;
  exchange?: string;
  limit?: number;
  market?: string;
  order?: "asc" | "desc";
  sort?: string;
  type?: string;
}

type ChartPriceOptions = (typeof chartPriceOptions)[number];

interface Store {
  fromDate: string;
  toDate: string;
  priceOption: ChartPriceOptions;
  selectedTickers: string[];
}
