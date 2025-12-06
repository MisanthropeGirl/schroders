import { ChangeEvent } from 'react';
import { Table, TableHead, TableCell, TableRow, TableBody, Checkbox } from '@mui/material';
import { useGetStockListQuery } from '../../app/apiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStocksSelected, selectedStocksUpdated } from './stockListSlice';

interface StockListExceptProps {
  stock: Stock;
}

function StockList() {
  const dispatch = useAppDispatch();
  const {
    isLoading,
    isError,
    isSuccess,
    data: stockListResponse = {} as StockListApiResponse,
    error
  } = useGetStockListQuery();

  const selectedStocks = useAppSelector(selectStocksSelected);
  const stockList = isSuccess ? stockListResponse.results : [];

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

  if (isError) {
    return (<div>{error.toString()}</div>);
  }

  if (isLoading) {
    return <div>Loading table</div>;
  }

  function StockListExcept({ stock }: StockListExceptProps) {
    return (
      <TableRow key={stock.ticker} hover>
        <TableCell>
          <Checkbox
            value={stock.ticker}
            checked={selectedStocks.includes(stock.ticker)}
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
    );
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
        {stockList.map(stock => (
          <StockListExcept key={stock.ticker} stock={stock} />
        ))}
      </TableBody>
    </Table>
  );
}

export default StockList;
