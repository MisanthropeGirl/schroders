import StockChart from './StockChart';
import { datesUpdated, priceOptionUpdated } from 'components/ChartOptions/chartOptionsSlice';
import { selectedTickersUpdated } from 'components/StockList/stockListSlice';
import { act, render, screen, waitFor, waitForElementToBeRemoved } from '../../test-utils';
import { DATE_MAX, DATE_MIDDLE, DATE_MIN } from '../../constants';
import * as utilities from '../../utilities';
import { A, A_DATE_RANGE, AA, AAM } from '../../mocks/Stocks';

// Mock Highcharts
jest.mock("highcharts", () => ({}));
jest.mock("highcharts-react-official", () => ({
  HighchartsReact: () => null,
}));

describe('StockChart', () => {
  beforeEach(() => {
    jest.spyOn(utilities, 'dataFetch').mockResolvedValue({ results: A });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('it renders without crashing', () => {
    render(<StockChart />);
  });

  test('it shows a loading message', () => {
    render(<StockChart />);

    expect(screen.queryByText('Awaiting data')).toBeInTheDocument();
    expect(screen.queryByTestId('stockchart')).not.toBeInTheDocument();
  });

  test('it should display an error message when data fetch fails with Error', async () => {
    jest.spyOn(utilities, 'dataFetch').mockRejectedValueOnce(new Error('Network error'));

    render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedTickers: ['A']
        }
      }
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));

    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.queryByTestId('stockchart')).not.toBeInTheDocument();
  });

  test('it should display a generic error message when fetch fails with non-Error', async () => {
    jest.spyOn(utilities, 'dataFetch').mockRejectedValueOnce('Unknown error');

    render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedTickers: ['A']
        }
      }
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));

    expect(screen.getByText('There was an error. Please refer to the console.')).toBeInTheDocument();
    expect(screen.queryByTestId('stockchart')).not.toBeInTheDocument();
  });

  test('it should display a chart when there is a ticker', async () => {
    render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedTickers: ['A']
        }
      }
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));

    await waitFor(() => {
      const chart = screen.queryByTestId('stockchart');
      expect(chart).toBeInTheDocument();
    });
  });

  test('it should display chart when there are multiple tickers', async () => {
    render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedTickers: ['A', 'AA', 'AAM']
        }
      }
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));
    expect(screen.getByTestId('stockchart')).toBeInTheDocument();
  });

  test('it should show the chart when a ticker is selected', async () => {
    const { store } = render(<StockChart />);

    expect(screen.queryByText('Awaiting data')).toBeInTheDocument();
    expect(screen.queryByTestId('stockchart')).not.toBeInTheDocument();

    act(() => store.dispatch(selectedTickersUpdated('A')));

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));
    expect(screen.queryByTestId('stockchart')).toBeInTheDocument();
  });

  test('it should remove the chart when the ticker array is empty', async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedTickers: ['A']
        }
      }
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));

    await waitFor(() => {
      const chart = screen.queryByTestId('stockchart');
      expect(chart).toBeInTheDocument();
    });

    act(() => store.dispatch(selectedTickersUpdated('A')));

    expect(screen.queryByTestId('stockchart')).not.toBeInTheDocument();
    expect(screen.queryByText('Awaiting data')).toBeInTheDocument();
  });

  test('it should show the chart when a ticker is selected and remove it when deselected', async () => {
    const { store } = render(<StockChart />);

    expect(screen.queryByText('Awaiting data')).toBeInTheDocument();
    expect(screen.queryByTestId('stockchart')).not.toBeInTheDocument();

    act(() => store.dispatch(selectedTickersUpdated('A')));

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));
    expect(screen.queryByTestId('stockchart')).toBeInTheDocument();

    act(() => store.dispatch(selectedTickersUpdated('A')));

    expect(screen.queryByTestId('stockchart')).not.toBeInTheDocument();
    expect(screen.queryByText('Awaiting data')).toBeInTheDocument();
  });

  test('it should update the chart when tickers are added', async () => {
    const dataFetchSpy = jest.spyOn(utilities, 'dataFetch')
      .mockResolvedValueOnce({ results: A })
      .mockResolvedValueOnce({ results: AA })
      .mockResolvedValueOnce({ results: AAM });

    const { store } = render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedTickers: ['A']
        }
      }
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));
    expect(screen.getByTestId('stockchart')).toBeInTheDocument();

    // Should have been called once initially
    expect(dataFetchSpy).toHaveBeenCalledTimes(1);

    act(() => store.dispatch(selectedTickersUpdated('AA')));

    // Should call dataFetch again for the new ticker
    await waitFor(() => expect(dataFetchSpy).toHaveBeenCalledTimes(2));

    // Verify it was called with new ticker
    expect(dataFetchSpy).toHaveBeenLastCalledWith(
      expect.stringContaining('AA'),
      expect.any(Object)
    );

    act(() => store.dispatch(selectedTickersUpdated('AAM')));

    // Should call dataFetch again for the new ticker
    await waitFor(() => expect(dataFetchSpy).toHaveBeenCalledTimes(3));

    // Verify it was called with new ticker
    expect(dataFetchSpy).toHaveBeenLastCalledWith(
      expect.stringContaining('AAM'),
      expect.any(Object)
    );

    // Chart should still be visible
    expect(screen.getByTestId('stockchart')).toBeInTheDocument();
  });

  test('it should update the chart when tickers are removed', async () => {
    const dataFetchSpy = jest.spyOn(utilities, 'dataFetch')
      .mockResolvedValueOnce({ results: A })
      .mockResolvedValueOnce({ results: AA })
      .mockResolvedValueOnce({ results: AAM });

    const { store } = render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedTickers: ['A', 'AA', 'AAM']
        }
      }
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));
    expect(screen.getByTestId('stockchart')).toBeInTheDocument();

    // remove a ticker
    act(() => store.dispatch(selectedTickersUpdated('AAM')));
    expect(store.getState().stocks.selectedTickers).toHaveLength(2);
    expect(screen.getByTestId('stockchart')).toBeInTheDocument();

    // and a second
    act(() => store.dispatch(selectedTickersUpdated('AA')));
    expect(store.getState().stocks.selectedTickers).toHaveLength(1);
    expect(screen.getByTestId('stockchart')).toBeInTheDocument();
  });

  test('it should update chart when price option changes', async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedTickers: ['A']
        }
      }
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));

    await waitFor(() => {
      const chart = screen.queryByTestId('stockchart');
      expect(chart).toBeInTheDocument();
    });

    act(() => store.dispatch(priceOptionUpdated('High')));

    // Chart should still be visible
    // Tried to test for the change to the chart title but the chart isn't being rendered
    expect(screen.getByTestId('stockchart')).toBeInTheDocument();
  });

  test('it should reload data when date range changes', async () => {
    const dataFetchSpy = jest.spyOn(utilities, 'dataFetch')
      .mockResolvedValueOnce({ results: A })
      .mockResolvedValueOnce({ results: A_DATE_RANGE })

    const { store } = render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedTickers: ['A']
        }
      }
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));

    // Should have been called once initially
    expect(dataFetchSpy).toHaveBeenCalledTimes(1);

    act(() => store.dispatch(datesUpdated({ fromDate: DATE_MIN, toDate: DATE_MIDDLE })));

    // Should call dataFetch again for the new date range
    await waitFor(() => expect(dataFetchSpy).toHaveBeenCalledTimes(2));

    // Verify it was called with new date
    expect(dataFetchSpy).toHaveBeenLastCalledWith(
      expect.stringContaining(DATE_MIDDLE),
      expect.any(Object)
    );
  });

  test('it should update all existing tickers when date range changes', async () => {
    const dataFetchSpy = jest.spyOn(utilities, 'dataFetch')
      .mockResolvedValueOnce({ results: A })
      .mockResolvedValueOnce({ results: AA });

    const { store } = render(<StockChart />, {
      preloadedState: {
        selectedTickers: ['A', 'AA']
      }
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));
    expect(screen.queryByTestId('stockchart')).toBeInTheDocument();
    expect(dataFetchSpy).toHaveBeenCalledTimes(2);

    act(() => store.dispatch(setFromDate(DATE_MIDDLE)));
    await waitFor(() => expect(dataFetchSpy).toHaveBeenCalledTimes(4));

    expect(dataFetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('A/'),
      expect.any(Object)
    );
    expect(dataFetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('AA/'),
      expect.any(Object)
    );

    expect(screen.queryByTestId('stockchart')).toBeInTheDocument();

    // Flush all pending promises and state updates
    await act(async () => {
      await Promise.resolve();
    });
  });

  test('it should do nothing when date range changes if there are no tickers', async () => {
    const dataFetchSpy = jest.spyOn(utilities, 'dataFetch').mockResolvedValueOnce({ results: A })

    const { store } = render(<StockChart />);

    // Should not be called as there are no tickers
    expect(dataFetchSpy).toHaveBeenCalledTimes(0);

    act(() => store.dispatch(datesUpdated({ fromDate: DATE_MIDDLE, toDate: DATE_MAX })));

    // Still shouldn't be called
    await waitFor(() => expect(dataFetchSpy).toHaveBeenCalledTimes(0));

    // Verify that the chart isn't visible
    expect(screen.queryByText('Awaiting data')).toBeInTheDocument();
    expect(screen.queryByTestId('stockchart')).not.toBeInTheDocument();
  });

});
