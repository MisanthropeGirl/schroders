import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from "../../test-utils";
import { POLYGON_LIST_URL } from "../../constants";
import { server } from "../../mocks/server";
import {
  stockListApiOutput,
  stockListApiOutput2,
  stockListApiOutputEmpty,
  stockListApiOutputMissingCurrency,
} from "../../mocks/StockList";
import { initialState } from "./stockListSlice";
import StockList from "./StockList";

describe("StockList", () => {
  afterEach(() => {
    server.resetHandlers();
  });

  test("it renders without crashing", () => {
    render(<StockList />);
  });

  test("it should display loading state initially and then a table", async () => {
    render(<StockList />);

    expect(screen.getByText("Loading table")).toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByText("Loading table"));
    expect(screen.queryByText("Loading table")).not.toBeInTheDocument();
    expect(screen.getByTestId("stocklist")).toBeInTheDocument();
  });

  test("it should display a table when the data fetch succeeds", async () => {
    render(<StockList />);

    await waitFor(() => screen.findByTestId("stocklist"));
    expect(screen.getByTestId("stocklist")).toBeInTheDocument();

    const table: HTMLTableElement = screen.getByTestId("stocklist");
    expect(table.tBodies[0].rows.length).toEqual(stockListApiOutput.results.length);

    expect(screen.queryAllByRole("checkbox").length).toEqual(stockListApiOutput.results.length);
  });

  test("it should display an empty table when the data fetch succeeds but there is an empty array", async () => {
    server.use(
      rest.get(POLYGON_LIST_URL, (_req, res, ctx) => {
        return res.once(ctx.json(stockListApiOutputEmpty));
      }),
    );

    render(<StockList />);

    await waitFor(() => screen.findByTestId("stocklist"));
    expect(screen.getByTestId("stocklist")).toBeInTheDocument();

    const table: HTMLTableElement = screen.getByTestId("stocklist");

    expect(table.tBodies[0].rows.length).toEqual(0);
    expect(screen.queryAllByRole("checkbox").length).toEqual(0);
  });

  test("handles data with missing currency field gracefully", async () => {
    server.use(
      rest.get(POLYGON_LIST_URL, (_req, res, ctx) => {
        return res.once(ctx.json(stockListApiOutputMissingCurrency));
      }),
    );

    render(<StockList />);

    await waitFor(() => screen.findByTestId("stocklist"));
    expect(screen.getByTestId("stocklist")).toBeInTheDocument();
  });

  test("allows selecting up to 3 tickers and disables remaining checkboxes", async () => {
    const user = userEvent.setup();
    render(<StockList />);

    await screen.findByTestId("stocklist");

    const table: HTMLTableElement = screen.getByTestId("stocklist");
    // eslint-disable-next-line testing-library/no-node-access
    const checkboxes = table.getElementsByTagName("input");

    await user.click(checkboxes[0]);
    expect(checkboxes[1]).toBeEnabled();

    await user.click(checkboxes[1]);
    expect(checkboxes[2]).toBeEnabled();

    await user.click(checkboxes[2]);
    expect(checkboxes[3]).toBeDisabled();

    await user.click(checkboxes[2]);
    expect(checkboxes[3]).toBeEnabled();
  });

  test("it should be possible to uncheck a selected ticker", async () => {
    const user = userEvent.setup();
    const { store } = render(<StockList />);

    await screen.findByTestId("stocklist");

    const table: HTMLTableElement = screen.getByTestId("stocklist");
    // eslint-disable-next-line testing-library/no-node-access
    const checkboxes = table.getElementsByTagName("input");

    // Check then uncheck
    await user.click(checkboxes[0]);
    expect(store.getState().stocks.selectedStocks).toContain(stockListApiOutput.results[0].ticker);

    await user.click(checkboxes[0]);
    expect(store.getState().stocks.selectedStocks).not.toContain(
      stockListApiOutput.results[0].ticker,
    );
  });

  test("checkboxes have accessible labels", async () => {
    render(<StockList />);

    await screen.findByTestId("stocklist");

    // Each checkbox should be associated with the ticker
    const firstCheckbox = screen.getByRole("checkbox", { name: "Select A" });
    expect(firstCheckbox).toBeInTheDocument();
  });

  test("it should not add a fourth ticker when clicking a disabled checkbox", async () => {
    const user = userEvent.setup();
    const { store } = render(<StockList />, {
      preloadedState: {
        stocks: {
          ...initialState,
          selectedStocks: ["A", "AA", "AAM"],
        },
      },
    });

    await screen.findByTestId("stocklist");

    expect(store.getState().stocks.selectedStocks).toHaveLength(3);

    const fourthCheckbox = screen.getAllByRole("checkbox")[3] as HTMLInputElement;
    expect(fourthCheckbox).toBeDisabled();

    // Try to click it anyway (userEvent will allow this)
    // The onChange handler should hit the if statement, discover the lack of an else branch and do nothing
    try {
      await user.click(fourthCheckbox);
    } catch (e) {
      // userEvent might throw for disabled elements
    }

    expect(store.getState().stocks.selectedStocks).toHaveLength(3);
  });

  test("it defensively ignores attempts to add a fourth ticker even if UI is bypassed", async () => {
    const { store } = render(<StockList />, {
      preloadedState: {
        stocks: {
          ...initialState,
          selectedStocks: ["A", "AA", "AAM"],
        },
      },
    });

    await screen.findByTestId("stocklist");

    expect(store.getState().stocks.selectedStocks).toHaveLength(3);

    // Now simulate a malicious/buggy scenario: manually enable and check the 4th checkbox
    const fourthCheckbox = screen.getAllByRole("checkbox")[3] as HTMLInputElement;
    fourthCheckbox.disabled = false;
    fireEvent.click(fourthCheckbox);

    // The defensive logic should prevent the 4th ticker from being added
    expect(store.getState().stocks.selectedStocks).toHaveLength(3);
  });

  test("the previous button should be initially disabled and do nothing", async () => {
    render(<StockList />);

    await screen.findByTestId("stocklist");

    const btn: HTMLButtonElement = screen.getByTestId("btn-prev");
    expect(btn).toBeDisabled();

    fireEvent.click(btn);

    const firstCheckbox = screen.getAllByRole("checkbox")[0] as HTMLInputElement;
    expect(firstCheckbox.value).toBe("A");
  });

  test("the previous button should be enabled when the next button is clicked", async () => {
    server.use(
      rest.get(POLYGON_LIST_URL, (_req, res, ctx) => {
        return res.once(ctx.json(stockListApiOutput));
      }),
      rest.get(POLYGON_LIST_URL, (_req, res, ctx) => {
        return res.once(ctx.json(stockListApiOutput2));
      }),
    );

    const user = userEvent.setup();
    render(<StockList />);

    await screen.findByTestId("stocklist");

    expect(screen.getByTestId("btn-prev")).toBeDisabled();
    expect(screen.getByTestId("btn-next")).toBeEnabled();

    await user.click(screen.getByTestId("btn-next"));

    await waitFor(() => {
      expect(screen.getByTestId("btn-prev")).toBeEnabled();
    });
  });

  test("a different set of stocks are shown when the user clicks on the navigation buttons", async () => {
    server.use(
      rest.get(POLYGON_LIST_URL, (_req, res, ctx) => {
        return res.once(ctx.json(stockListApiOutput));
      }),
      rest.get(POLYGON_LIST_URL, (_req, res, ctx) => {
        return res.once(ctx.json(stockListApiOutput2));
      }),
      rest.get(POLYGON_LIST_URL, (_req, res, ctx) => {
        return res.once(ctx.json(stockListApiOutput));
      }),
    );

    const user = userEvent.setup();
    render(<StockList />);

    await screen.findByTestId("stocklist");

    expect(screen.getByTestId("btn-prev")).toBeDisabled();

    const firstCheckbox = screen.getAllByRole("checkbox")[0] as HTMLInputElement;
    expect(firstCheckbox.value).toBe("A");

    await user.click(screen.getByTestId("btn-next"));

    await waitFor(() => {
      const firstCheckbox = screen.getAllByRole("checkbox")[0] as HTMLInputElement;
      expect(firstCheckbox.value).toBe("AAT");
    });

    expect(screen.getByTestId("btn-prev")).toBeEnabled();

    await user.click(screen.getByTestId("btn-prev"));

    await waitFor(() => {
      const firstCheckbox = screen.getAllByRole("checkbox")[0] as HTMLInputElement;
      expect(firstCheckbox.value).toBe("A");
    });

    expect(screen.getByTestId("btn-prev")).toBeDisabled();
  });

  test("it should display an error message when data fetch fails with Error", async () => {
    server.use(
      rest.get(POLYGON_LIST_URL, (_req, res, ctx) => {
        return res.once(ctx.status(404));
      }),
    );

    render(<StockList />);

    await waitFor(() => {
      expect(screen.getByText(/An error has occurred/)).toBeInTheDocument();
    });

    expect(screen.queryByTestId("stocklist")).not.toBeInTheDocument();
  });
});
