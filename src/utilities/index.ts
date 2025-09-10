import { POLYGON_API_KEY, POLYGON_API_URL } from './../constants';

export const dataFetch = async (options: SearchParams) => {
  const params = convertObjectToString(options);
  const response = await fetch(`${POLYGON_API_URL}?${params}&apiKey=${POLYGON_API_KEY}`);
  if (!response.ok) {
    throw new Error(`HTTP error: Status ${response.status}`);
  }
  const apiOutput: ApiResult = await response.json();
  return  apiOutput.results as Stock[];
};

export const convertObjectToString = (obj: object): string => {
  const output = Object.entries(obj).reduce((str, [key, val]) => {
    return `${str}&${key}=${val}`;
  }, '');
  return output.substring(1);
};
