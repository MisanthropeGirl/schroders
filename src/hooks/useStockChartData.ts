import { useState, useEffect, useRef } from "react";
import { useLazyGetStockDataQuery } from "../app/apiSlice";
import { chartPriceOptions, PRICE_SERIES_CODES, createInitialChartDataState } from "../constants";
import { dataTransform, removeTransformedDataByTicker } from "../utilities";

export function useStockChartData(
  selectedStocks: string[],
  chartTickers: string[],
  fromDate: string,
  toDate: string,
  onTickerUpdate: (ticker: string) => void,
) {
  const [getStockData, result] = useLazyGetStockDataQuery();
  const [chartData, setChartData] = useState<Record<string, TransformedData[]>>(
    createInitialChartDataState(),
  );
  const [fetchErrors, setFetchErrors] = useState<Record<string, string>>({});
  const isInitialMount = useRef(true);

  const loadData = async (ticker: string, from: string = fromDate, to: string = toDate) => {
    try {
      const response = await getStockData({ ticker, from, to }, true).unwrap();
      updateChartData(response.ticker, response.results);

      // Clear any previous error for this ticker
      setFetchErrors(prev => {
        const updated = { ...prev };
        delete updated[ticker];
        return updated;
      });
    } catch (error) {
      // Store the error for this ticker
      setFetchErrors(prev => ({
        ...prev,
        [ticker]: error instanceof Error ? error.message : "Failed to fetch data",
      }));
    }
  };

  const updateChartData = (ticker: string, results: StockData[]) => {
    setChartData(prev => {
      const updated = { ...prev };
      removeTransformedDataByTicker(updated, ticker);

      chartPriceOptions.forEach(option => {
        updated[option].push({
          type: "line",
          name: ticker,
          data: dataTransform(
            results,
            PRICE_SERIES_CODES[option.toUpperCase() as keyof typeof PRICE_SERIES_CODES],
          ),
        });
      });

      return updated;
    });
  };

  // Load data for newly selected stocks
  useEffect(() => {
    const existingSet = new Set(chartTickers);

    selectedStocks
      .filter(ticker => !existingSet.has(ticker))
      .forEach(ticker => {
        loadData(ticker).then(() => onTickerUpdate(ticker));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStocks]);

  // Reload data when dates change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    selectedStocks.forEach(ticker => loadData(ticker, fromDate, toDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  // Remove data for deselected stocks
  useEffect(() => {
    const selectedSet = new Set(selectedStocks);
    const tickersToRemove = chartTickers.filter(ticker => !selectedSet.has(ticker));

    if (tickersToRemove.length > 0) {
      setChartData(prev => {
        const updated = { ...prev };
        tickersToRemove.forEach(ticker => removeTransformedDataByTicker(updated, ticker));
        return updated;
      });

      tickersToRemove.forEach(ticker => onTickerUpdate(ticker));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStocks]);

  return {
    chartData,
    fetchErrors,
    isError: result.isError,
    error: result.error,
  };
}
