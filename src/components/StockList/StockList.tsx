import { ChangeEvent, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { POLYGON_LIST_URL, POLYGON_API_KEY, listUrlOptions } from "../../constants";
import { selectStocksSelected, selectedStocksUpdated } from "./stockListSlice";
import "./stockList.css";

interface StockListExceptProps {
  stock: Stock;
}

function StockList() {
  const selectedStocks = useAppSelector(selectStocksSelected);
  const dispatch = useAppDispatch();

  const [prevUrl, setPrevUrl] = useState("");
  const [url, setUrl] = useState(POLYGON_LIST_URL);

  // need this to persist between renders
  const allUrls = useRef([url]);

  const fetchData = async (): Promise<StockListApiResponse> => {
    try {
      const response = await axios.get(url, {
        params: {
          apiKey: POLYGON_API_KEY,
          ...listUrlOptions,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(`HTTP error: Status ${error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        throw new Error("Network error: No response received");
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  };

  const {
    isLoading,
    isError,
    isSuccess,
    data: stockListResponse,
    error,
  } = useQuery({
    queryKey: ["stockList", url],
    queryFn: fetchData,
  });

  const navigate = (newUrl: string) => {
    // new url add to array
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
    // defensive code - error will, in practice, always be of type Error
    return (
      <div>{error instanceof Error ? error.message : /* istanbul ignore next */ String(error)}</div>
    );
  }

  if (isLoading || !isSuccess) {
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
          disabled={prevUrl === ""}
          data-testid="btn-prev"
        >
          &laquo; Previous
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(stockListResponse.next_url)}
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
          {stockListResponse.results.map(stock => (
            <StockListExcept key={stock.ticker} stock={stock} />
          ))}
        </TableBody>
      </Table>
    </>
  );
}

export default StockList;
