import StockList from './components/StockList/StockList';
import StockChart from './components/StockChart/StockChart';
import ChartOptions from './components/ChartOptions/ChartOptions';

function App() {
  return (
    <>
      <StockChart />
      <ChartOptions />
      <StockList />
    </>
  );
}

export default App;
