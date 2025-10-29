import { render } from './test-utils';
import App from './App';

// Mock Highcharts
jest.mock("highcharts", () => ({}));
jest.mock("highcharts-react-official", () => ({
  HighchartsReact: () => null,
}));

test('renders without crashing', () => {
  render(<App />);
});
