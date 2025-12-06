interface ApiResponse {
  count: number;
  request_id: string;
  status: string;
}

interface StockDataApiResponse extends ApiResponse {
  adjusted: boolean;
  queryCount: number;
  request_id: string;
  results: StockData[];
  resultsCount: number;
  ticker: string;
}

interface StockListApiResponse extends ApiResponse {
  next_url: string;
  results: Stock[];
}

interface Stock {
  active?: boolean;
  cik?: string;
  composite_figi?: string;
  currency_name?: string;
  delisted_utc?: string;
  last_updated_utc?: string;
  locale: 'us' | 'global';
  market: 'stocks' | 'crypto' | 'fx' | 'otc' | 'indices';
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

type TransformedChartData = [number, number][];

interface TransformedData {
  name: string;
  type: string;
  data: TransformedChartData;
}
