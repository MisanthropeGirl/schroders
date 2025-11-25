import { Provider } from 'react-redux';
import StockList from './components/StockList/StockList';
import StockChart from './components/StockChart/StockChart';
import ChartOptions from './components/ChartOptions/ChartOptions';
import { store } from './app/store';

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
