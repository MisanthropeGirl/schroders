import { convertObjectToString, dataFetch } from '.';
import { server } from '../tests/server'; 
import { POLYGON_LIST_URL } from '../constants';
import { stockListApiOutput } from './index.mock';

describe('convertObjectToString', () => {
  test('it will return an empty string if there is an empty object', () => {
    const str = convertObjectToString({});
    expect(str).toBe('');
  });

  test('it will return a string if there is a populated object', () => {
    const obj1 = {a: 1};
    const obj2 = {a: 1, b: 2};

    const str1 = convertObjectToString(obj1);
    expect(str1).toBe('&a=1');

    const str2 = convertObjectToString(obj2);
    expect(str2).toBe('&a=1&b=2');
  });
});

describe('dataFetch', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
  
  it('it will return an api response', async () => {
    await expect(dataFetch(POLYGON_LIST_URL, {})).resolves.toEqual(stockListApiOutput);
  })
});
