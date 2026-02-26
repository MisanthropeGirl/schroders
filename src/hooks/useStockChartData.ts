import { useState, useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  chartPriceOptions,
  PRICE_SERIES_CODES,
  createInitialChartDataState,
  POLYGON_DATA_URL,
  POLYGON_API_KEY,
} from "../constants";
import { dataTransform, removeTransformedDataByTicker } from "../utilities";

export function useStockChartData(
  selectedStocks: string[],
  chartTickers: string[],
  fromDate: string,
  toDate: string,
  onTickerUpdate: (ticker: string) => void,
) {
  const [chartData, setChartData] = useState<Record<string, TransformedData[]>>(
    createInitialChartDataState(),
  );
  const [fetchErrors, setFetchErrors] = useState<Record<string, string>>({});

  // Fetch data for all selected stocks
  const queries = useQueries({
    queries: selectedStocks.map(ticker => ({
      queryKey: ["stock", ticker, fromDate, toDate],
      queryFn: async () => {
        const response = await fetch(
          `${POLYGON_DATA_URL}/${ticker}/range/1/day/${fromDate}/${toDate}?apiKey=${POLYGON_API_KEY}&adjusted=true&sort=asc`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch ${ticker}`);
        }

        return response.json();
      },
      enabled: !!ticker, // Only fetch if ticker exists
    })),
  });

  // Could have this in the dependency array but eslint complains
  // Need more than just dataUpdatedAt in here or the useEffect won't be triggered
  const queryUpdateKey = queries
    .map((q, i) => `${selectedStocks[i]}-${q.status}-${q.dataUpdatedAt}`)
    .join(",");

  // Update chart data when queries succeed
  useEffect(() => {
    queries.forEach((query, index) => {
      const ticker = selectedStocks[index];

      if (query.isSuccess && query.data) {
        // Update chart tickers in Redux if not already there
        if (!chartTickers.includes(ticker)) {
          onTickerUpdate(ticker);
        }

        // Update chart data
        setChartData(prev => {
          const updated = { ...prev };
          removeTransformedDataByTicker(updated, ticker);

          chartPriceOptions.forEach(option => {
            updated[option].push({
              type: "line",
              name: ticker,
              data: dataTransform(
                query.data.results,
                PRICE_SERIES_CODES[option.toUpperCase() as keyof typeof PRICE_SERIES_CODES],
              ),
            });
          });

          return updated;
        });

        // Clear error for this ticker
        setFetchErrors(prev => {
          const updated = { ...prev };
          delete updated[ticker];
          return updated;
        });
      }

      if (query.isError) {
        // Store error for this ticker
        // includes defensive code - error will, in practice, always be of type Error
        setFetchErrors(prev => ({
          ...prev,
          [ticker]:
            query.error instanceof Error
              ? query.error.message
              : /* istanbul ignore next */ String(query.error),
        }));
      }
    });
    // Only want to run when query data updates (tracked by status & dataUpdatedAt - see queryUpdateKey declaration)
    // Including everything else, e.g. selectedStocks, would cause unnecessary re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryUpdateKey]);

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
  };
}
