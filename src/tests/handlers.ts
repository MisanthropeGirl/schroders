import { rest } from 'msw';
import { POLYGON_LIST_URL } from '../constants';
import { stockListApiOutput } from '../mocks';
 
export const handlers = [
	rest.get(POLYGON_LIST_URL, (req, res, ctx) => {
		return res(ctx.json(stockListApiOutput));
	}),
];
