import { rest } from "msw";
import StockChart from "./StockChart";
import { act, render, screen, waitForElementToBeRemoved } from "../../test-utils";
import { setChartPricingOption, setFromDate, setSelectedTickers } from "../../actions";
import { DATE_MIDDLE, POLYGON_DATA_URL } from "../../constants";
import { server } from "../../mocks/server";
import * as utilities from "../../utilities";

// Mock Highcharts
jest.mock("highcharts", () => ({}));
jest.mock("highcharts-react-official", () => ({
  HighchartsReact: () => null,
}));

describe("StockChart", () => {
  beforeAll(() => server.listen());

  afterEach(() => {
    server.resetHandlers();
    jest.restoreAllMocks();
  });

  afterAll(() => server.close());

  test("it renders without crashing", () => {
    render(<StockChart />);
  });

  test("it shows a loading message", () => {
    render(<StockChart />);

    expect(screen.queryByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
  });

  test("it should display an error message when data fetch fails with Error", async () => {
    const errStatus = 404;
    const errMsg = `HTTP error: Status ${errStatus}`;

    server.use(
      rest.get(`${POLYGON_DATA_URL}/*`, (_req, res, ctx) => {
        return res.once(ctx.status(errStatus));
      }),
    );

    render(<StockChart />, {
      preloadedState: {
        selectedTickers: ["A"],
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));

    expect(screen.getByText(errMsg)).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
  });

  test("it should display a generic error message when fetch fails with non-Error", async () => {
    jest.spyOn(utilities, "dataFetch").mockRejectedValueOnce("Unknown error");

    render(<StockChart />, {
      preloadedState: {
        selectedTickers: ["A"],
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));

    expect(
      screen.getByText("There was an error. Please refer to the console."),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
  });

  test("it should display a chart when there is a ticker", async () => {
    render(<StockChart />, {
      preloadedState: {
        selectedTickers: ["A"],
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.queryByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should display chart when there are multiple tickers", async () => {
    render(<StockChart />, {
      preloadedState: {
        selectedTickers: ["A", "AA", "AAM"],
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should show the chart when a ticker is selected", async () => {
    const { store } = render(<StockChart />);

    expect(screen.queryByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();

    act(() => store.dispatch(setSelectedTickers("A")));

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.queryByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should remove the chart when the ticker array is empty", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        selectedTickers: ["A"],
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.queryByTestId("stockchart")).toBeInTheDocument();

    act(() => store.dispatch(setSelectedTickers("A")));

    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
    expect(screen.queryByText("Awaiting data")).toBeInTheDocument();
  });

  test("it should show the chart when a ticker is selected and remove it when deselected", async () => {
    const { store } = render(<StockChart />);

    expect(screen.queryByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();

    act(() => store.dispatch(setSelectedTickers("A")));

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.queryByTestId("stockchart")).toBeInTheDocument();

    act(() => store.dispatch(setSelectedTickers("A")));

    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
    expect(screen.queryByText("Awaiting data")).toBeInTheDocument();
  });

  test("it should update the store and chart should still be visible when tickers are added", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        selectedTickers: ["A"],
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(store.getState().selectedTickers).toHaveLength(1);
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();

    // add a ticker
    act(() => store.dispatch(setSelectedTickers("AA")));
    expect(store.getState().selectedTickers).toHaveLength(2);
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();

    // and a third
    act(() => store.dispatch(setSelectedTickers("AAM")));
    expect(store.getState().selectedTickers).toHaveLength(3);
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should update the store and chart should still be visible when tickers are removed", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        selectedTickers: ["A", "AA", "AAM"],
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();

    // remove a ticker
    act(() => store.dispatch(setSelectedTickers("AAM")));
    expect(store.getState().selectedTickers).toHaveLength(2);
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();

    // and a second
    act(() => store.dispatch(setSelectedTickers("AA")));
    expect(store.getState().selectedTickers).toHaveLength(1);
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should update chart when price option changes", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        selectedTickers: ["A"],
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(screen.queryByTestId("stockchart")).toBeInTheDocument();

    act(() => store.dispatch(setChartPricingOption("High")));

    // Chart should still be visible
    // Tried to test for the change to the chart title but the chart isn't being rendered
    expect(screen.getByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should reload data when date range changes", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        selectedTickers: ["A"],
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));

    act(() => store.dispatch(setFromDate(DATE_MIDDLE)));
    expect(store.getState().selectedTickers).toHaveLength(1);
  });

  test("it should update all existing tickers when date range changes", async () => {
    const { store } = render(<StockChart />, {
      preloadedState: {
        selectedTickers: ["A", "AA"],
      },
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Awaiting data"));
    expect(store.getState().selectedTickers).toHaveLength(2);
    expect(screen.queryByTestId("stockchart")).toBeInTheDocument();

    act(() => store.dispatch(setFromDate(DATE_MIDDLE)));
    expect(store.getState().selectedTickers).toHaveLength(2);
    expect(screen.queryByTestId("stockchart")).toBeInTheDocument();
  });

  test("it should do nothing when date range changes if there are no tickers", async () => {
    const { store } = render(<StockChart />);

    expect(store.getState().selectedTickers).toHaveLength(0);

    // Verify that the chart isn't visible
    expect(screen.queryByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();

    act(() => store.dispatch(setFromDate(DATE_MIDDLE)));
    expect(store.getState().selectedTickers).toHaveLength(0);

    // Verify that the chart still isn't visible
    expect(screen.queryByText("Awaiting data")).toBeInTheDocument();
    expect(screen.queryByTestId("stockchart")).not.toBeInTheDocument();
  });
});
