import { Provider } from "react-redux";
import { store } from "./app/store";
import ChartOptions from "./components/ChartOptions/ChartOptions";
import StockChart from "./components/StockChart/StockChart";
import StockList from "./components/StockList/StockList";

function App() {
  return (
    <Provider store={store}>
      <StockChart />
      <ChartOptions />
      <StockList />
    </Provider>
  );
}

export default App;
