import StockChart from './StockChart';
import { A } from '../../mocks/Stocks';
import { render, screen, waitFor, waitForElementToBeRemoved } from '../../test-utils';
import * as utilities from '../../utilities';
import { setNewTicker, setRemovedTicker } from 'actions';

// Mock Highcharts
jest.mock("highcharts", () => ({}));
jest.mock("highcharts-react-official", () => ({
  HighchartsReact: () => null,
}));

describe('StockChart', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
    jest.spyOn(utilities, 'dataFetch').mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<StockChart />, {
      preloadedState: {
        selectedTickers: ['A']
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
        selectedTickers: ['A']
      }
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));

    expect(screen.getByText('There was an error. Please refer to the console.')).toBeInTheDocument();
    expect(screen.queryByTestId('stockchart')).not.toBeInTheDocument();
  });

  test('it should display a chart when there is data', async () => {
    jest.spyOn(utilities, 'dataFetch').mockResolvedValueOnce({ results: A });

    render(<StockChart />, {
      preloadedState: {
        selectedTickers: ['A']
      }
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));

    await waitFor(() => {
      const chart = screen.queryByTestId('stockchart');
      expect(chart).toBeInTheDocument();
    });
  });

  test('it should show the chart when a ticker is selected', async () => {
    jest.spyOn(utilities, 'dataFetch').mockResolvedValueOnce({ results: A });

    const { store } = render(<StockChart />);

    expect(screen.queryByText('Awaiting data')).toBeInTheDocument();
    expect(screen.queryByTestId('stockchart')).not.toBeInTheDocument();

    store.dispatch(setNewTicker('A'));

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));

    await waitFor(() => {
      const chart = screen.queryByTestId('stockchart');
      expect(chart).toBeInTheDocument();
    });
  });

  test('it should remove the chart when the ticker array is empty', async () => {
    jest.spyOn(utilities, 'dataFetch').mockResolvedValueOnce({ results: A });

    const { store } = render(<StockChart />, {
      preloadedState: {
        selectedTickers: ['A']
      }
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Awaiting data'));
    
    await waitFor(() => {
      const chart = screen.queryByTestId('stockchart');
      expect(chart).toBeInTheDocument();
    });

    store.dispatch(setRemovedTicker('A'));

    await waitForElementToBeRemoved(() => screen.queryByTestId('stockchart'));

    await waitFor(() => {
      const msg = screen.queryByText('Awaiting data');
      expect(msg).toBeInTheDocument();
    });
  });
});
