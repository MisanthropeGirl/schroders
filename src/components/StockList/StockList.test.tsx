import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen, waitFor } from "../../test-utils";
import { useGetStockListQuery } from "../../app/apiSlice";
import {
  stockListApiOutput,
  stockListApiOutput2,
  stockListApiOutputEmpty,
  stockList,
} from "../../mocks/StockList";
import { initialState } from "./stockListSlice";
import StockList from "./StockList";

// Mock the entire API slice
jest.mock("../../app/apiSlice", () => ({
  ...jest.requireActual("../../app/apiSlice"),
  useGetStockListQuery: jest.fn(),
}));

const mockUseGetStockListQuery = useGetStockListQuery as jest.MockedFunction<
  typeof useGetStockListQuery
>;

describe("StockList", () => {
  beforeEach(() => {
    // Default successful mock
    mockUseGetStockListQuery.mockReturnValue({
      data: stockListApiOutput,
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: undefined,
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("it renders without crashing", async () => {
    render(<StockList />);

    await waitFor(() => {
      expect(screen.queryByTestId("stocklist")).toBeInTheDocument();
    });
  });

  test("it should display loading state initially", () => {
    mockUseGetStockListQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: undefined,
    } as any);

    render(<StockList />);

    expect(screen.getByText("Loading table")).toBeInTheDocument();
    expect(screen.queryByTestId("stocklist")).not.toBeInTheDocument();
  });

  test("it should display a table when the data fetch succeeds", async () => {
    render(<StockList />);

    await waitFor(() => screen.getByTestId("stocklist"));

    const table: HTMLTableElement = screen.getByTestId("stocklist");

    expect(table.tBodies[0].rows.length).toEqual(stockList.length);
    expect(table.getElementsByTagName("input").length).toEqual(stockList.length);
  });

  test("it should display an empty table when the data fetch succeeds but there is an empty array", async () => {
    mockUseGetStockListQuery.mockReturnValue({
      data: stockListApiOutputEmpty,
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: undefined,
    } as any);

    render(<StockList />);

    await waitFor(() => screen.getByTestId("stocklist"));

    const table: HTMLTableElement = screen.getByTestId("stocklist");

    expect(table.tBodies[0].rows.length).toEqual(0);
    expect(table.getElementsByTagName("input").length).toEqual(0);
  });

  test("handles data with missing currency field gracefully", async () => {
    const dataWithMissingCurrency = {
      ...stockListApiOutput,
      results: [{ ...stockList[0], currency_name: undefined }],
    };

    mockUseGetStockListQuery.mockReturnValue({
      data: dataWithMissingCurrency,
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: undefined,
    } as any);

    render(<StockList />);

    await waitFor(() => screen.getByTestId("stocklist"));

    expect(screen.getByTestId("stocklist")).toBeInTheDocument();
  });

  test("allows selecting up to 3 tickers and disables remaining checkboxes", async () => {
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
    expect(store.getState().stocks.selectedStocks).toContain(stockList[0].ticker);

    await user.click(checkboxes[0]);
    expect(store.getState().stocks.selectedStocks).not.toContain(stockList[0].ticker);
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
        stocks: {
          ...initialState,
          selectedStocks: ["A", "AA", "AAM"],
        },
      },
    });

    await waitFor(() => screen.getByTestId("stocklist"));

    const table: HTMLTableElement = screen.getByTestId("stocklist");
    const checkboxes = table.getElementsByTagName("input");

    expect(store.getState().stocks.selectedStocks).toHaveLength(3);
    expect(checkboxes[3]).toBeDisabled();

    // Try to click it anyway (userEvent will allow this)
    // The onChange handler should hit the if statement, discover the lack of an else banch and do nothing
    try {
      await user.click(checkboxes[3]);
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

    await waitFor(() => screen.getByTestId("stocklist"));

    const table: HTMLTableElement = screen.getByTestId("stocklist");
    const checkboxes = table.getElementsByTagName("input");

    expect(store.getState().stocks.selectedStocks).toHaveLength(3);

    // Now simulate a malicious/buggy scenario: manually enable and check the 4th checkbox
    const fourthCheckbox = checkboxes[3] as HTMLInputElement;
    fourthCheckbox.disabled = false;
    fireEvent.click(fourthCheckbox);

    // The defensive logic should prevent the 4th ticker from being added
    expect(store.getState().stocks.selectedStocks).toHaveLength(3);
    expect(store.getState().stocks.selectedStocks).not.toContain(stockList[3].ticker);
  });

  test("the previous button should be initially disabled and do nothing", () => {
    render(<StockList />);

    const btn: HTMLButtonElement = screen.getByTestId("btn-prev");
    expect(btn.disabled).toBe(true);

    fireEvent.click(btn);

    const table: HTMLTableElement = screen.getByTestId("stocklist");
    const checkboxes = table.getElementsByTagName("input");
    expect(checkboxes[0].value).toBe("A");
  });

  test("the previous button should be enabled when the next button is clicked", async () => {
    const user = userEvent.setup();
    render(<StockList />);

    const btnPrev: HTMLButtonElement = screen.getByTestId("btn-prev");
    expect(btnPrev.disabled).toBe(true);

    const btnNext: HTMLButtonElement = screen.getByTestId("btn-next");
    expect(btnNext.disabled).toBe(false);

    await user.click(btnNext);
    expect(btnPrev.disabled).toBe(false);
  });

  test("a different set of stocks are shown when the user clicks on the navigation buttons", async () => {
    mockUseGetStockListQuery
      .mockReturnValueOnce({
        data: stockListApiOutput,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: undefined,
      } as any)
      // Second call (after clicking next) returns different data
      .mockReturnValueOnce({
        data: stockListApiOutput2,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: undefined,
      } as any)
      // Third call (after clicking prev) returns initial data again
      .mockReturnValueOnce({
        data: stockListApiOutput,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: undefined,
      } as any);

    const user = userEvent.setup();
    render(<StockList />);

    const btnPrev: HTMLButtonElement = screen.getByTestId("btn-prev");
    const btnNext: HTMLButtonElement = screen.getByTestId("btn-next");

    const table: HTMLTableElement = screen.getByTestId("stocklist");
    let checkboxes = table.getElementsByTagName("input");

    expect(btnPrev.disabled).toBe(true);
    expect(checkboxes[0].value).toBe("A");

    await user.click(btnNext);
    expect(btnPrev.disabled).toBe(false);

    await waitFor(() => {
      checkboxes = table.getElementsByTagName("input");
      expect(checkboxes[0].value).toBe("AAT");
    });

    await user.click(btnPrev);
    expect(btnPrev.disabled).toBe(true);

    await waitFor(() => {
      checkboxes = table.getElementsByTagName("input");
      expect(checkboxes[0].value).toBe("A");
    });
  });

  test("it should display an error message when data fetch fails with Error", async () => {
    mockUseGetStockListQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
      isError: true,
      error: new Error("Network error"),
    } as any);

    render(<StockList />);

    expect(screen.getByText("Error: Network error")).toBeInTheDocument();
    expect(screen.queryByTestId("stocklist")).not.toBeInTheDocument();
  });
});
