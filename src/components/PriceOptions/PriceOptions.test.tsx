import { ReactElement } from "react";
import userEvent from "@testing-library/user-event";
import { render, screen } from "../../test-utils";
import PriceOptions from "./PriceOptions";

// setup function
function setup(tsx: ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(tsx),
  };
}

describe("PriceOptions", () => {
  test("it renders without crashing", () => {
    render(<PriceOptions />);
  });

  test("it renders four price options, the first of which should be checked", () => {
    render(<PriceOptions />);

    expect(screen.getByRole("radio", { name: "Select Close" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Select High" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Select Low" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Select Open" })).toBeInTheDocument();

    const radioClose = screen.getByTestId("radio-Close");

    expect(radioClose).toBeChecked();
  });

  test("it changes the pricing option", async () => {
    const { user, store } = setup(<PriceOptions />);

    const radioClose = screen.getByTestId("radio-Close");
    const radioOpen = screen.getByTestId("radio-Open");

    expect(radioClose).toBeChecked();
    expect(radioOpen).not.toBeChecked();

    await user.click(radioOpen);

    expect(radioOpen).toBeChecked();
    expect(radioClose).not.toBeChecked();
    expect(store.getState().price.priceOption).toBe("Open");
  });
});
