// this is the v2 syntax
// import { http, HttpResponse } from "msw";
// import { POLYGON_DATA_URL, POLYGON_LIST_URL } from "../constants";
// import { stockListApiOutput } from "./StockList";

// export const handlers = [
//   http.get(POLYGON_LIST_URL, () => {
//     return HttpResponse.json(stockListApiOutput);
//   }),
//   http.get(POLYGON_DATA_URL, () => {
//     return HttpResponse.json({});
//   }),
// ];

import { rest } from "msw";
import { POLYGON_DATA_URL, POLYGON_LIST_URL } from "../constants";
import { stockListApiOutput } from "./StockList";
import { stockDataApiResponse } from "./Stocks";

export const handlers = [
  rest.get(POLYGON_LIST_URL, (_req, res, ctx) => {
    return res(ctx.json(stockListApiOutput));
  }),
  rest.get(`${POLYGON_DATA_URL}/:ticker/range/1/day/:from/:to`, (_req, res, ctx) => {
    return res(ctx.json(stockDataApiResponse));
  }),
];
