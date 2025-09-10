import { rest } from 'msw';
import { POLYGON_API_URL } from '../constants';
import { apiOutput } from '../utilities/index.mock';
 
export const handlers = [
	rest.get(POLYGON_API_URL, (req, res, ctx) => {
		return res(ctx.json(apiOutput));
	}),
];

