import { act, render, screen, waitFor, waitForElementToBeRemoved } from "../../test-utils";
import { useLazyGetStockDataQuery } from "../../app/apiSlice";
import { DATE_MAX, DATE_MIDDLE, DATE_MIN } from "../../constants";
import { A } from "../../mocks/Stocks";
import { datesUpdated } from "../DateSelector/dateSelectorSlice";
import { priceOptionUpdated } from "../PriceOptions/priceOptionsSlice";
import { selectedStocksUpdated } from "../StockList/stockListSlice";
import StockChart from "./StockChart";

// Mock the entire API slice
jest.mock("../../app/apiSlice", () => ({
  ...jest.requireActual("../../app/apiSlice"),
  useLazyGetStockDataQuery: jest.fn(),
}));

// Mock Highcharts
jest.mock("highcharts", () => ({}));
jest.mock("highcharts-react-official", () => ({
  HighchartsReact: () => null,
}));

const mockUseLazyGetStockDataQuery = useLazyGetStockDataQuery as jest.MockedFunction<
  typeof useLazyGetStockDataQuery
>;

describe("StockChart", () => {
  let mockTrigger: jest.Mock;
  let mockResult: any;

  beforeEach(() => {
    // Create mock trigger function
    mockTrigger = jest.fn().mockImplementation(() => ({
      unwrap: jest.fn().mockResolvedValue({
        ticker: "A",
        results: [A],
      }),
    }));

    // Create mock result object
    mockResult = {
      data: undefined,
      isLoading: false,
      isSuccess: false,
      isError: false,
      isUninitialized: true,
      error: undefined,
    };

    const mockLastPromise = {
      lastArg: mockResult,
    };

    // Mock returns tuple: [trigger, result, mockLastPromise]
    // Only adding mockLastPromise as TS complained when it was left out
    mockUseLazyGetStockDataQuery.mockReturnValue([mockTrigger, mockResult, mockLastPromise]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("it renders without crashing", () => {
    render(<StockChart />);
    expect(screen.getByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
  });

  test("it shows a loading message", () => {
    mockResult.isLoading = true;
    mockResult.isUninitialized = false;

    render(<StockChart />);

    expect(screen.queryByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
  });

  test("it should display an error message when data fetch fails with Error", async () => {
    mockResult.isError = true;
    mockResult.isUninitialized = false;
    mockResult.error = new Error("Network error");

    render(<StockChart />);

    expect(screen.getByText("Error: Network error")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
  });

  test("it calls trigger function when stock is selected", async () => {
    const { store } = render(<StockChart />);

    act(() => store.dispatch(selectedStocksUpdated("A")));

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith(
        {
          ticker: "A",
          from: expect.any(String),
          to: expect.any(String),
        },
        true,
      );
    });
  });

  test("it handles successful data fetch via unwrap", async () => {
    const mockData = {
      ticker: "A",
      results: [A],
    };

    const mockUnwrap = jest.fn().mockResolvedValue(mockData);
    mockTrigger.mockImplementation(() => ({
      unwrap: mockUnwrap,
    }));

    const { store } = render(<StockChart />);

    // Trigger selection
    act(() => store.dispatch(selectedStocksUpdated("A")));

    await waitFor(() => {
      expect(mockUnwrap).toHaveBeenCalled();
    });

    // Verify chart data was updated
    await waitFor(() => {
      expect(screen.getByTestId("stockchart")).toBeInTheDocument();
    });
  });

  test("it handles an unsuccessful data fetch via unwrap", async () => {
    const mockUnwrap = jest.fn().mockRejectedValue(new Error("API Error"));
    mockTrigger.mockImplementation(() => ({
      unwrap: mockUnwrap,
    }));

    const { store } = render(<StockChart />);

    // Trigger selection
    act(() => store.dispatch(selectedStocksUpdated("A")));

    await waitFor(() => {
      expect(mockUnwrap).toHaveBeenCalled();
    });

    expect(screen.getByText(/Failed to load A/)).toBeInTheDocument();
  });

  test("it handles an unsuccessful data fetch via unwrap wdth no error message", async () => {
    const mockUnwrap = jest.fn().mockRejectedValue("");
    mockTrigger.mockImplementation(() => ({
      unwrap: mockUnwrap,
    }));

    const { store } = render(<StockChart />);

    // Trigger selection
    act(() => store.dispatch(selectedStocksUpdated("A")));

    await waitFor(() => {
      expect(mockUnwrap).toHaveBeenCalled();
    });

    expect(screen.getByText(/Failed to load A/)).toBeInTheDocument();
  });

  test("it shows chart for successful tickers and error for failed ones", async () => {
    mockTrigger
      .mockImplementationOnce(() => ({
        unwrap: jest.fn().mockResolvedValue({ ticker: "A", results: [A] }),
      }))
      .mockImplementationOnce(() => ({
        unwrap: jest.fn().mockRejectedValue(new Error("Network error")),
      }));

    const { store } = render(<StockChart />);

    act(() => store.dispatch(selectedStocksUpdated("A")));

    await waitFor(() => {
      expect(screen.getByTestId("stockchart")).toBeInTheDocument();
    });

    act(() => store.dispatch(selectedStocksUpdated("AA")));

    await waitFor(() => {
      expect(screen.getByText(/Failed to load AA/i)).toBeInTheDocument();
    });

    // Chart should still be visible for successful ticker
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should display a chart when there is a ticker", async () => {
    mockResult.isSuccess = true;
    mockResult.isUninitialized = false;

    render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedStocks: ["A"],
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId("stockchart")).toBeInTheDocument();
    });
  });

  test("it should display chart when there are multiple tickers", async () => {
    render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedStocks: ["A", "AA", "AAM"],
        },
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should show the chart when a ticker is selected", async () => {
    const { store } = render(<StockChart />);

    expect(screen.queryByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();

    act(() => store.dispatch(selectedStocksUpdated("A")));

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.queryByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should remove the chart when the ticker array is empty", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedStocks: ["A"],
        },
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));

    await waitFor(() => {
      expect(screen.queryByTestId("stockchart")).toBeInTheDocument();
    });

    act(() => store.dispatch(selectedStocksUpdated("A")));

    await waitFor(() => {
      expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
      expect(screen.queryByText("Awaiting data")).toBeInTheDocument();
    });
  });

  test("it should show the chart when a ticker is selected and remove it when deselected", async () => {
    const { store } = render(<StockChart />);

    expect(screen.queryByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();

    act(() => store.dispatch(selectedStocksUpdated("A")));

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.queryByTestId("stockchart")).toBeInTheDocument();

    act(() => store.dispatch(selectedStocksUpdated("A")));

    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
    expect(screen.queryByText("Awaiting data")).toBeInTheDocument();
  });

  test("it should update the chart when tickers are added", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedStocks: ["A"],
        },
      },
    });

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith(
        {
          ticker: "A",
          from: expect.any(String),
          to: expect.any(String),
        },
        true,
      );
    });

    expect(screen.getByTestId("stockchart")).toBeInTheDocument();

    act(() => store.dispatch(selectedStocksUpdated("AA")));

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith(
        {
          ticker: "AA",
          from: expect.any(String),
          to: expect.any(String),
        },
        true,
      );
    });

    act(() => store.dispatch(selectedStocksUpdated("AAM")));

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith(
        {
          ticker: "AAM",
          from: expect.any(String),
          to: expect.any(String),
        },
        true,
      );
    });

    // Chart should still be visible
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should update the chart when tickers are removed", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedStocks: ["A", "AA", "AAM"],
        },
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();

    // remove a ticker
    act(() => store.dispatch(selectedStocksUpdated("AAM")));
    expect(store.getState().stocks.selectedStocks).toHaveLength(2);
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();

    // and a second
    act(() => store.dispatch(selectedStocksUpdated("AA")));
    expect(store.getState().stocks.selectedStocks).toHaveLength(1);
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should update chart when price option changes", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedStocks: ["A"],
        },
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));

    await waitFor(() => {
      const chart = screen.queryByTestId("stockchart");
      expect(screen.queryByTestId("stockchart")).toBeInTheDocument();
    });

    act(() => store.dispatch(priceOptionUpdated("High")));

    // Chart should still be visible
    // Tried to test for the change to the chart title but the chart isn't being rendered
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should reload data when date range changes", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedStocks: ["A"],
        },
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));

    act(() => store.dispatch(datesUpdated({ fromDate: DATE_MIN, toDate: DATE_MIDDLE })));

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith(
        {
          ticker: "A",
          from: DATE_MIN,
          to: DATE_MIDDLE,
        },
        true,
      );
    });
  });

  test("it should update all existing tickers when date range changes", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedStocks: ["A", "AA"],
        },
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.queryByTestId("stockchart")).toBeInTheDocument();

    act(() => store.dispatch(datesUpdated({ fromDate: DATE_MIN, toDate: DATE_MIDDLE })));

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith(
        {
          ticker: "A",
          from: DATE_MIN,
          to: DATE_MIDDLE,
        },
        true,
      );
    });

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith(
        {
          ticker: "AA",
          from: DATE_MIN,
          to: DATE_MIDDLE,
        },
        true,
      );
    });

    // Flush all pending promises and state updates
    await act(async () => {
      await Promise.resolve();
    });
  });

  test("it should do nothing when date range changes if there are no tickers", async () => {
    const { store } = render(<StockChart />);

    act(() => store.dispatch(datesUpdated({ fromDate: DATE_MIDDLE, toDate: DATE_MAX })));

    // Verify that the chart isn't visible
    expect(screen.queryByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
  });
});
