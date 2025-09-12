import React, { ChangeEvent, useState } from 'react';
import StockList from './components/StockList/StockList';
import StockChart from './components/StockChart/StockChart';
import ChartOptions from './components/ChartOptions/ChartOptions';

function App() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [priceOption, setPriceOption] = useState<string>('Close');

  const changeSelectedTickers = (e: ChangeEvent<HTMLInputElement>): void => {
    const ticker = e.target.value;

    if (e.target.checked) {
      if (selectedTickers.length < 3) {
        setSelectedTickers([...selectedTickers, ticker]);
      }
    } else {
      setSelectedTickers(selectedTickers.filter(it => it !== ticker));
    }
  };
  
  // need to figure out how to disabled the other checkboxes if length = 3
  // useEffect that reloads

  const changePriceOption = (e: ChangeEvent<HTMLInputElement>): void => {
    setPriceOption(e.target.value);
  };

  return (
    <>
      <StockChart selectedTickers={selectedTickers} priceOption={priceOption} />
      <ChartOptions changePriceOption={changePriceOption} />
      <StockList selectedTickers={selectedTickers} changeSelectedTickers={changeSelectedTickers} />
    </>
  );
}

export default App;
