import React, { ChangeEvent, useEffect, useState } from 'react';
import { Table, TableHead, TableCell, TableRow, TableBody, Checkbox } from '@mui/material';
import { POLYGON_LIST_URL } from '../../constants';
import { dataFetch } from '../../utilities';

function StockList() {
  const [data, setData] = useState<Stock[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [error, setError] = useState<boolean | string>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stockList = await dataFetch(
          POLYGON_LIST_URL,
          {
            market: 'stocks',
            type: 'CS',
            exchange: 'XNYS',
            active: true,
            order: 'asc',
            limit: 100,
            sort: 'ticker'
          }
        );
        setData(stockList.results);
        setError(false);
      }
      catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(true);
          throw err;
        }
        setData([])
      }
      finally {
        setLoading(false);
      }
    }

    loadData();
  }, [])

  useEffect(() => {
    // keep this useEffect to (re)load the chart?
    // Though chart will be a separate component, not loaded via this one so how does that work again?
    console.log(selectedStocks);
  }, [selectedStocks]);

  const handleChangeEvent = (e: ChangeEvent<HTMLInputElement>): void => {
    const ticker = e.target.value;
    if (e.target.checked) {
      // need to figure out how to disabled the other checkboxes if length = 3
      if (selectedStocks.length < 3) {
        setSelectedStocks([...selectedStocks, ticker]);
      }
    } else {
      setSelectedStocks(selectedStocks.filter(it => it !== ticker));
    }
  };

  if (loading) {
    return <div>Loading table</div>;
  }
  
  if (error) {
    return (<div>{(typeof error === 'string') ? error : 'There was an error. Please refer to the console.'}</div>);
  } 

  return (
    // In the real world there would probably be fewer rows on show at any time
    // And there'd be pagination
    // And likely some price data
    <Table size='small' stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell variant='head'></TableCell>
          <TableCell align='left' variant='head'>Ticker</TableCell>
          <TableCell align='left' variant='head'>Name</TableCell>
          <TableCell align='left' variant='head'>Exchange</TableCell>
          <TableCell align='left' variant='head'>Currency</TableCell>

        </TableRow>
      </TableHead>
      <TableBody>
        {(data || []).map((stock: Stock, index: number) => {
          return (
            <TableRow key={index} hover>
              <TableCell>
                <Checkbox value={stock.ticker} onChange={handleChangeEvent} />
              </TableCell>
              <TableCell>{stock.ticker}</TableCell>
              <TableCell>{stock.name}</TableCell>
              <TableCell>{stock.primary_exchange}</TableCell>
              <TableCell>{stock.currency_name?.toUpperCase()}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  );
}

export default StockList;
