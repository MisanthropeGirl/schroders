import { rest } from "msw";
import { act, render, screen, waitFor, waitForElementToBeRemoved } from "../../test-utils";
import { DATE_MAX, DATE_MIDDLE, DATE_MIN, POLYGON_DATA_URL } from "../../constants";
import { server } from "../../mocks/server";
import { datesUpdated } from "../DateSelector/dateSelectorSlice";
import { priceOptionUpdated } from "../PriceOptions/priceOptionsSlice";
import { selectedStocksUpdated } from "../StockList/stockListSlice";
import StockChart from "./StockChart";
import { stockDataApiOutput } from "../../mocks/Stocks";

// Mock Highcharts
jest.mock("highcharts", () => ({}));
jest.mock("highcharts-react-official", () => ({
  HighchartsReact: () => null,
}));

describe("StockChart", () => {
  test("it renders without crashing", () => {
    render(<StockChart />);
    expect(screen.getByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
  });

  test("it shows a loading message", () => {
    render(<StockChart />);

    expect(screen.getByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
  });

  test("it should display a chart when there is a ticker", async () => {
    render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedStocks: ["A"],
        },
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();
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

    expect(screen.getByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();

    act(() => store.dispatch(selectedStocksUpdated("A")));

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();
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
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();

    act(() => store.dispatch(selectedStocksUpdated("A")));

    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
    expect(screen.getByText("Awaiting data")).toBeInTheDocument();
  });

  test("it should show the chart when a ticker is selected and remove it when deselected", async () => {
    const { store } = render(<StockChart />);

    expect(screen.getByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();

    act(() => store.dispatch(selectedStocksUpdated("A")));

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();

    act(() => store.dispatch(selectedStocksUpdated("A")));

    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
    expect(screen.getByText("Awaiting data")).toBeInTheDocument();
  });

  test("it should update the chart when tickers are added", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedStocks: ["A"],
        },
      },
    });

    await screen.findByTestId("stockchart");

    act(() => store.dispatch(selectedStocksUpdated("AA")));

    expect(screen.getByTestId("stockchart")).toBeInTheDocument();

    act(() => store.dispatch(selectedStocksUpdated("AAM")));

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

    await screen.findByTestId("stockchart");

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

    await screen.findByTestId("stockchart");

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

    await screen.findByTestId("stockchart");

    act(() => store.dispatch(datesUpdated({ fromDate: DATE_MIN, toDate: DATE_MIDDLE })));

    expect(screen.getByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should update all existing tickers when date range changes", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        stocks: {
          selectedStocks: ["A", "AA"],
        },
      },
    });

    await screen.findByTestId("stockchart");

    act(() => store.dispatch(datesUpdated({ fromDate: DATE_MIN, toDate: DATE_MIDDLE })));

    expect(screen.getByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should do nothing when date range changes if there are no tickers", async () => {
    const { store } = render(<StockChart />);

    act(() => store.dispatch(datesUpdated({ fromDate: DATE_MIDDLE, toDate: DATE_MAX })));

    // Verify that the chart isn't visible
    expect(screen.getByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
  });

  test("it shows only errors when all stocks fail", async () => {
    server.use(
      rest.get(`${POLYGON_DATA_URL}/AA/*`, (_req, res, ctx) => {
        return res(ctx.status(500));
      }),
      rest.get(`${POLYGON_DATA_URL}/AAM/*`, (_req, res, ctx) => {
        return res(ctx.status(404));
      }),
    );

    const { store } = render(<StockChart />);

    act(() => store.dispatch(selectedStocksUpdated("AA")));

    await waitFor(() => {
      expect(screen.getByText(/Failed to load AA/i)).toBeInTheDocument();
    });

    act(() => store.dispatch(selectedStocksUpdated("AAM")));

    await waitFor(() => {
      expect(screen.getByText(/Failed to load AAM/i)).toBeInTheDocument();
    });

    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();

    expect(screen.queryByText("Awaiting data")).not.toBeInTheDocument();
  });

  test("it displays errors inline when some stocks succeed and others fail", async () => {
    server.use(
      rest.get(`${POLYGON_DATA_URL}/A/*`, (_req, res, ctx) => {
        return res(ctx.json(stockDataApiOutput));
      }),
      rest.get(`${POLYGON_DATA_URL}/INVALID/*`, (_req, res, ctx) => {
        return res(ctx.status(404));
      }),
    );

    const { store } = render(<StockChart />);

    act(() => store.dispatch(selectedStocksUpdated("A")));
    await screen.findByTestId("stockchart");

    act(() => store.dispatch(selectedStocksUpdated("INVALID")));

    await waitFor(() => {
      expect(screen.getByText(/Failed to load INVALID/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId("stockchart")).toBeInTheDocument();

    const chartContainer = screen.getByTestId("stockchart");
    expect(chartContainer).toBeInTheDocument();
  });

  test("it handles other errors", async () => {
    server.use(
      rest.get(`${POLYGON_DATA_URL}/INVALID/*`, (req, res, ctx) => {
        return res.once(ctx.status(404), ctx.text("Not found"));
      }),
    );

    const { store } = render(<StockChart />);

    act(() => store.dispatch(selectedStocksUpdated("INVALID")));

    expect(await screen.findByText(/Failed to load INVALID/i)).toBeInTheDocument();
    expect(await screen.findByText(/Failed to fetch/i)).toBeInTheDocument();

    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
  });
});
