import React, { useEffect, useState } from 'react';
import { dataFetch } from '../utilities';
import { Table, TableHead, TableCell, TableRow, TableBody } from '@mui/material';

function StockList() {
  const [data, setData] = useState<Stock[] | null>();
  const [error, setError] = useState<boolean | string>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stockData = await dataFetch({
          market: 'stocks',
          type: 'CS',
          exchange: 'XNYS',
          active: true,
          order: 'asc',
          limit: 100,
          sort: 'ticker'
        });
        setData(stockData);
        setError(false);
      }
      catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(true);
          throw err;
        }
        setData(null)
      }
      finally {
        setLoading(false);
      }
    }

    loadData();
  }, [])

  if (loading) {
    // show a spinner or some such
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
              <TableCell>{stock.ticker}</TableCell>
              <TableCell>{stock.name}</TableCell>
              <TableCell>{stock.primary_exchange}</TableCell>
              <TableCell>{stock.currency_name.toUpperCase()}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  );
}

export default StockList;
