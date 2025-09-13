import React, { ChangeEvent, useState } from 'react';
import StockList from './components/StockList/StockList';
import StockChart from './components/StockChart/StockChart';
import ChartOptions from './components/ChartOptions/ChartOptions';

function App() {
  const [newTicker, setNewTicker] = useState<string>('');
  const [removedTicker, setRemovedTicker] = useState<string>('');
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [priceOption, setPriceOption] = useState<string>('Close');

  const changeSelectedTickers = (e: ChangeEvent<HTMLInputElement>): void => {
    const ticker = e.target.value;

    if (e.target.checked) {
      if (selectedTickers.length < 3) {
        setNewTicker(ticker);
        setRemovedTicker('');
        setSelectedTickers([...selectedTickers, ticker]);
      }
    } else {
      setNewTicker('');
      setRemovedTicker(ticker);
      setSelectedTickers(selectedTickers.filter(it => it !== ticker));
    }
  };

  const changePriceOption = (e: ChangeEvent<HTMLInputElement>): void => {
    setPriceOption(e.target.value);
  };

  return (
    <>
      <StockChart newTicker={newTicker} removedTicker={removedTicker} selectedTickers={selectedTickers} priceOption={priceOption} />
      <ChartOptions changePriceOption={changePriceOption} />
      <StockList selectedTickers={selectedTickers} changeSelectedTickers={changeSelectedTickers} />
    </>
  );
}

export default App;
