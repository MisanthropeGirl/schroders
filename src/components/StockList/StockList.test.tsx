import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import StockList from "./StockList";
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from "../../test-utils";
import { POLYGON_LIST_URL } from "../../constants";
import { server } from "../../mocks/server";
import {
  stockList,
  stockListApiOutputEmpty,
  stockListApiOutputMissingCurrency,
  stockListApiOutputNull,
} from "../../mocks/StockList";
import * as utilities from "../../utilities";

describe("StockList", () => {
  test("it renders without crashing", async () => {
    render(<StockList />);

    await waitForElementToBeRemoved(() => screen.queryByText("Loading table"));
    expect(screen.queryByText("Loading table")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId("stocklist")).toBeInTheDocument();
    });
  });

  test("it should display a table when the data fetch succeeds", async () => {
    render(<StockList />);

    await waitFor(() => screen.getByTestId("stocklist"));

    const table: HTMLTableElement = screen.getByTestId("stocklist");

    expect(table.tBodies[0].rows.length).toEqual(stockList.length);
    expect(table.getElementsByTagName("input").length).toEqual(stockList.length);
  });

  test("it should display an empty table when the data fetch succeeds but there is an empty array", async () => {
    server.use(
      rest.get(POLYGON_LIST_URL, (_req, res, ctx) => {
        return res.once(ctx.json(stockListApiOutputEmpty));
      }),
    );

    render(<StockList />);

    await waitFor(() => screen.getByTestId("stocklist"));

    const table: HTMLTableElement = screen.getByTestId("stocklist");

    expect(table.tBodies[0].rows.length).toEqual(0);
    expect(table.getElementsByTagName("input").length).toEqual(0);
  });

  test("it should display an empty table when the data fetch succeeds but there is no data", async () => {
    server.use(
      rest.get(POLYGON_LIST_URL, (_req, res, ctx) => {
        return res(ctx.json(stockListApiOutputNull));
      }),
    );

    render(<StockList />);

    await waitFor(() => screen.getByTestId("stocklist"));

    const table: HTMLTableElement = screen.getByTestId("stocklist");

    expect(table.tBodies[0].rows.length).toEqual(0);
    expect(table.getElementsByTagName("input").length).toEqual(0);
  });

  test("it should display an error message when data fetch fails with Error", async () => {
    const errStatus = 404;
    const errMsg = `HTTP error: Status ${errStatus}`;

    server.use(
      rest.get(POLYGON_LIST_URL, (_req, res, ctx) => {
        return res.once(ctx.status(errStatus));
      }),
    );

    render(<StockList />);

    await waitForElementToBeRemoved(() => screen.queryByText("Loading table"));

    expect(screen.getByText(errMsg)).toBeInTheDocument();
    expect(screen.queryByTestId("stocklist")).not.toBeInTheDocument();
  });

  test("it should display a generic error message when fetch fails with non-Error", async () => {
    jest.spyOn(utilities, "dataFetch").mockRejectedValueOnce("Unknown error");

    render(<StockList />);

    await waitForElementToBeRemoved(() => screen.queryByText("Loading table"));

    expect(
      screen.getByText("There was an error. Please refer to the console."),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("stocklist")).not.toBeInTheDocument();
  });

  test("it handles data with missing currency field gracefully", async () => {
    server.use(
      rest.get(POLYGON_LIST_URL, (_req, res, ctx) => {
        return res.once(ctx.json(stockListApiOutputMissingCurrency));
      }),
    );

    render(<StockList />);

    await waitFor(() => screen.getByTestId("stocklist"));

    const table: HTMLTableElement = screen.getByTestId("stocklist");
    expect(table).toBeInTheDocument();
    expect(table.tBodies[0].rows[0].cells[4].textContent).toBe("");
  });

  test("it allows selecting up to 3 tickers and disables remaining checkboxes", async () => {
    const user = userEvent.setup();
    render(<StockList />);

    await waitFor(() => screen.getByTestId("stocklist"));

    const table: HTMLTableElement = screen.getByTestId("stocklist");
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

    await waitFor(() => screen.getByTestId("stocklist"));

    const table: HTMLTableElement = screen.getByTestId("stocklist");
    const checkboxes = table.getElementsByTagName("input");

    // Check then uncheck
    await user.click(checkboxes[0]);
    expect(store.getState().selectedTickers).toContain(stockList[0].ticker);

    await user.click(checkboxes[0]);
    expect(store.getState().selectedTickers).not.toContain(stockList[0].ticker);
  });

  test("checkboxes have accessible labels", async () => {
    render(<StockList />);

    await waitFor(() => screen.getByTestId("stocklist"));

    // Each checkbox should be associated with the ticker
    const firstCheckbox = screen.getByRole("checkbox", { name: "Select A" });
    expect(firstCheckbox).toBeInTheDocument();
  });

  test("it should not add a fourth ticker when clicking a disabled checkbox", async () => {
    const user = userEvent.setup();
    const { store } = render(<StockList />, {
      preloadedState: {
        selectedTickers: ["A", "AA", "AAM"],
      },
    });

    await waitFor(() => screen.getByTestId("stocklist"));

    const table: HTMLTableElement = screen.getByTestId("stocklist");
    const checkboxes = table.getElementsByTagName("input");

    expect(store.getState().selectedTickers).toHaveLength(3);
    expect(checkboxes[3]).toBeDisabled();

    // Try to click it anyway (userEvent will allow this)
    // The onChange handler should hit the if statement, discover the lack of an else banch and do nothing
    try {
      await user.click(checkboxes[3]);
    } catch (e) {
      // userEvent might throw for disabled elements
    }

    expect(store.getState().selectedTickers).toHaveLength(3);
  });

  test("it defensively ignores attempts to add a fourth ticker even if UI is bypassed", async () => {
    const { store } = render(<StockList />, {
      preloadedState: {
        selectedTickers: ["A", "AA", "AAM"],
      },
    });

    await waitFor(() => screen.getByTestId("stocklist"));

    const table: HTMLTableElement = screen.getByTestId("stocklist");
    const checkboxes = table.getElementsByTagName("input");

    expect(store.getState().selectedTickers).toHaveLength(3);

    // Now simulate a malicious/buggy scenario: manually enable and check the 4th checkbox
    const fourthCheckbox = checkboxes[3] as HTMLInputElement;
    fourthCheckbox.disabled = false;
    fireEvent.click(fourthCheckbox);

    // The defensive logic should prevent the 4th ticker from being added
    expect(store.getState().selectedTickers).toHaveLength(3);
    expect(store.getState().selectedTickers).not.toContain(stockList[3].ticker);
  });
});
