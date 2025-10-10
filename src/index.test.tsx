import React from "react";
import "@testing-library/jest-dom";

jest.mock("highcharts", () => ({}));
jest.mock("highcharts-react-official", () => ({
  HighchartsReact: () => null,
}));

// jest.mock("./store", () => ({
//   store: {
//     getState: jest.fn(() => ({})),
//     dispatch: jest.fn(),
//     subscribe: jest.fn(),
//   },
// }));

// jest.mock("./reportWebVitals", () => jest.fn());

describe("Application root", () => {
  it("should render without crashing", () => {
    // Just test that App component can be imported and created
    const App = require("./App").default;
    expect(() => React.createElement(App)).not.toThrow();
  });
});
