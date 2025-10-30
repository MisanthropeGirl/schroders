import userEvent from '@testing-library/user-event';
import StockList from './StockList';
import { render, screen, waitFor, waitForElementToBeRemoved } from '../../test-utils';
import { stockList } from '../../mocks';
import * as utilities from '../../utilities';

describe('StockList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('it renders without crashing', () => {
    jest.spyOn(utilities, 'dataFetch').mockResolvedValueOnce({ results: stockList });

    render(<StockList />);
  });

  test('it should initially show a loading message', () => {
    jest.spyOn(utilities, 'dataFetch').mockResolvedValueOnce({ results: stockList });

    render(<StockList />);

    expect(screen.queryByText('Loading table')).toBeInTheDocument();
  });

  test('it should eventually hide the loading message and show a table', async () => {
    jest.spyOn(utilities, 'dataFetch').mockResolvedValueOnce({ results: stockList });

    render(<StockList />);

    await waitForElementToBeRemoved(() => screen.queryByText('Loading table'))
    expect(screen.queryByText('Loading table')).not.toBeInTheDocument();

    await waitFor(() => {
      const table = screen.queryByTestId('stocklist');
      expect(table).toBeInTheDocument();
    });
  });

  test('it should display a table when the data fetch succeeds', async () => {
    jest.spyOn(utilities, 'dataFetch').mockResolvedValueOnce({ results: stockList });

    render(<StockList />);

    await waitFor(() => screen.getByTestId('stocklist'));

    const table: HTMLTableElement = screen.getByTestId('stocklist');

    expect(table.tBodies[0].rows.length).toEqual(10);
    expect(table.getElementsByTagName('input').length).toEqual(10);
  });

  test('it should display an empty table when the data fetch succeeds but there is an empty array', async () => {
    jest.spyOn(utilities, 'dataFetch').mockResolvedValueOnce({ results: [] });

    render(<StockList />);

    await waitFor(() => screen.getByTestId('stocklist'));

    const table: HTMLTableElement = screen.getByTestId('stocklist');

    expect(table.tBodies[0].rows.length).toEqual(0);
    expect(table.getElementsByTagName('input').length).toEqual(0);
  });

  test('it should display an empty table when the data fetch succeeds but there is no data', async () => {
    jest.spyOn(utilities, 'dataFetch').mockResolvedValueOnce({ results: null });

    render(<StockList />);

    await waitFor(() => screen.getByTestId('stocklist'));

    const table: HTMLTableElement = screen.getByTestId('stocklist');

    expect(table.tBodies[0].rows.length).toEqual(0);
    expect(table.getElementsByTagName('input').length).toEqual(0);
  });

  test('it should be possible to tick three checkboxes but not any more', async () => {
    jest.spyOn(utilities, 'dataFetch').mockResolvedValueOnce({ results: stockList });

    const user = userEvent.setup();
    render(<StockList />);

    await waitFor(() => screen.getByTestId('stocklist'));

    const table: HTMLTableElement = screen.getByTestId('stocklist');
    const checkboxes = table.getElementsByTagName('input');

    await user.click(checkboxes[0]);
    expect(checkboxes[1]).toBeEnabled();

    await user.click(checkboxes[1]);
    expect(checkboxes[2]).toBeEnabled();

    await user.click(checkboxes[2]);
    expect(checkboxes[3]).toBeDisabled();

    await user.click(checkboxes[2]);
    expect(checkboxes[3]).toBeEnabled();
  });

  test('it should display an error message when data fetch fails with Error', async () => {
    jest.spyOn(utilities, 'dataFetch').mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<StockList />);

    await waitForElementToBeRemoved(() => screen.queryByText('Loading table'));

    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.queryByTestId('stocklist')).not.toBeInTheDocument();
  });

  test('it should display a generic error message when fetch fails with non-Error', async () => {
    jest.spyOn(utilities, 'dataFetch').mockRejectedValueOnce('Unknown error');

    render(<StockList />);

    await waitForElementToBeRemoved(() => screen.queryByText('Loading table'));

    expect(screen.getByText('There was an error. Please refer to the console.')).toBeInTheDocument();
    expect(screen.queryByTestId('stocklist')).not.toBeInTheDocument();
  });

});
