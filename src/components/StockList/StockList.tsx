import { ChangeEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, TableHead, TableCell, TableRow, TableBody, Checkbox } from '@mui/material';
import { POLYGON_LIST_URL } from '../../constants';
import { selectSelectedTickers } from '../../selectors';
import { dataFetch } from '../../utilities';
import { setNewTicker, setRemovedTicker, setSelectedTickers } from '../../actions';

function StockList() {
  const [data, setData] = useState<Stock[]>([]);
  const [error, setError] = useState<boolean | string>(false);
  const [loading, setLoading] = useState(true);

  const selectedTickers = useSelector(selectSelectedTickers);

  const dispatch = useDispatch()

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
          setError('There was an error. Please refer to the console.');
        }
        setData([])
      }
      finally {
        setLoading(false);
      }
    }

    loadData();
  }, [])

  const handleClickEvent = (e: ChangeEvent<HTMLInputElement>): void => {
    const ticker = e.target.value;

    if (e.target.checked) {
      if (selectedTickers.length < 3) {
        dispatch(setNewTicker(ticker));
        dispatch(setRemovedTicker(''));
        dispatch(setSelectedTickers(ticker));
      }
    } else {
      dispatch(setNewTicker(''));
      dispatch(setRemovedTicker(ticker));
      dispatch(setSelectedTickers(ticker));
    }
  };

  if (loading) {
    return <div>Loading table</div>;
  }
  
  if (error) {
    return (<div>{error}</div>);
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
        {(data || []).map((stock: Stock, index: number) => {
          return (
            <TableRow key={index} hover>
              <TableCell>
                <Checkbox
                  value={stock.ticker}
                  disabled={selectedTickers.length > 2 && !selectedTickers.includes(stock.ticker)}
                  slotProps={{input: { 'aria-label': `Select ${stock.ticker}` }}}
                  onChange={handleClickEvent}
                />
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
