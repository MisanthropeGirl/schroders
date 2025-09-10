interface ApiResult {
  count: number;
  next_url: string;
  request_id: string;
  status: string;
  results: Stock[];
}

// Several of these would, in the real world, be types, e.g.
// primary_exchange: Exchange;
// type Exchange = XNYS | ?? | ??;
// but setting them all as strings suffices for this
interface Stock {
  active: boolean;
  cik: string;
  composite_figi: string;
  currency_name: string;
  last_updated_utc: string;
  locale: string;
  market: string;
  name: string;
  primary_exchange: string;
  share_class_figi: string;
  ticker: string;
  type: string;
}

interface SearchParams {
  market?: string;
  exchange?: string;
  active?: boolean;
  order?: 'asc' | 'desc';
  limit?: number;
  sort?: string;
  type?: string;
}
