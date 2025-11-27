import { ChangeEvent, useEffect } from 'react';
import { Table, TableHead, TableCell, TableRow, TableBody, Checkbox } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchStocks, selectedStocksUpdated, selectStocksSelected, selectStocksError, selectStocksStatus, selectStocks } from './stockListSlice';

function StockList() {
  const dispatch = useAppDispatch();
  const stockList = useAppSelector(selectStocks);
  const selectedStocks = useAppSelector(selectStocksSelected);
  const status = useAppSelector(selectStocksStatus);
  const error = useAppSelector(selectStocksError);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchStocks());
    }
  }, [status, dispatch])

  const handleClickEvent = (e: ChangeEvent<HTMLInputElement>): void => {
    const ticker = e.target.value;

    if (e.target.checked) {
      if (selectedStocks.length < 3) {
        dispatch(selectedStocksUpdated(ticker));
      }
    } else {
      dispatch(selectedStocksUpdated(ticker));
    }
  };

  if (status === 'rejected') {
    return (<div>{error}</div>);
  }

  if (status === 'idle' || status === 'pending') {
    return <div>Loading table</div>;
  }

  return (
    // In the real world there would probably be fewer rows on show at any time
    // And there'd be pagination
    // And likely some price data
    <Table size='small' stickyHeader data-testid='stocklist'>
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
        {stockList?.map((stock: Stock) => (
          <TableRow key={stock.ticker} hover>
            <TableCell>
              <Checkbox
                value={stock.ticker}
                disabled={selectedStocks.length > 2 && !selectedStocks.includes(stock.ticker)}
                slotProps={{input: { 'aria-label': `Select ${stock.ticker}` }}}
                onChange={handleClickEvent}
              />
            </TableCell>
            <TableCell>{stock.ticker}</TableCell>
            <TableCell>{stock.name}</TableCell>
            <TableCell>{stock.primary_exchange}</TableCell>
            <TableCell>{stock.currency_name?.toUpperCase()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default StockList;
