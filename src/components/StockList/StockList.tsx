import { ChangeEvent, useCallback, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useGetStockListQuery, usePrefetch } from "../../app/apiSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectStocksSelected, selectedStocksUpdated } from "./stockListSlice";
import "./stockList.css";

interface StockListExceptProps {
  stock: Stock;
}

function StockList() {
  const selectedStocks = useAppSelector(selectStocksSelected);
  const dispatch = useAppDispatch();
  const prefetchPage = usePrefetch("getStockList");

  const [prevUrl, setPrevUrl] = useState("");
  const [url, setUrl] = useState("/v3/reference/tickers");

  // need this to persist between renders
  const allUrls = useRef([url]);

  const {
    isLoading,
    isError,
    isSuccess,
    data: stockListResponse = {} as StockListApiResponse,
    error,
  } = useGetStockListQuery(url);

  const prefetchPrev = useCallback(() => {
    prefetchPage(prevUrl);
  }, [prevUrl, prefetchPage]);

  const prefetchNext = useCallback(() => {
    prefetchPage(stockListResponse.next_url);
  }, [prefetchPage, stockListResponse]);

  const stockList = isSuccess ? stockListResponse.results : [];

  const navigate = (newUrl: string) => {
    // new url? add to array
    if (!new Set(allUrls.current).has(newUrl)) {
      allUrls.current.push(newUrl);
    }

    // set new url
    setUrl(newUrl);

    // and the previous one
    const currIndex = allUrls.current.indexOf(newUrl);
    setPrevUrl(currIndex > 0 ? allUrls.current[currIndex - 1] : "");
  };

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
    return <div>{error.toString()}</div>;
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
            slotProps={{ input: { "aria-label": `Select ${stock.ticker}` } }}
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
    // And there'd be pagination (now added!)
    // And likely some price data
    <>
      <div className="navigation">
        <Button
          variant="outlined"
          onClick={() => navigate(prevUrl)}
          onMouseEnter={prefetchPrev}
          disabled={prevUrl === ""}
          data-testid="btn-prev"
        >
          &laquo; Previous
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(stockListResponse.next_url)}
          onMouseEnter={prefetchNext}
          data-testid="btn-next"
        >
          Next &raquo;
        </Button>
      </div>
      <Table size="small" stickyHeader data-testid="stocklist">
        <TableHead>
          <TableRow>
            <TableCell variant="head"></TableCell>
            <TableCell align="left" variant="head">
              Ticker
            </TableCell>
            <TableCell align="left" variant="head">
              Name
            </TableCell>
            <TableCell align="left" variant="head">
              Exchange
            </TableCell>
            <TableCell align="left" variant="head">
              Currency
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stockList.map(stock => (
            <StockListExcept key={stock.ticker} stock={stock} />
          ))}
        </TableBody>
      </Table>
    </>
  );
}

export default StockList;
