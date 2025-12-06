import { useEffect, useRef, useState } from "react";
import * as Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { useLazyGetStockDataQuery } from "../../app/apiSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { PRICE_SERIES_CODES, chartPriceOptions, createInitialChartDataState } from "../../constants";
import { removeTransformedDataByTicker, dataTransform } from "../../utilities";
import { selectPriceOption } from "../PriceOptions/priceOptionsSlice";
import { selectFromDate, selectToDate } from "../DateSelector/dateSelectorSlice";
import { selectChartTickers, tickersUpdated } from "./stockChartSlice";
import { selectStocksSelected } from "../StockList/stockListSlice";
import './StockChart.css';

function StockChart() {
  const dispatch = useAppDispatch();
  const [getStockData, result] = useLazyGetStockDataQuery();

  const [chartData, setChartData] = useState<Record<string, TransformedData[]>>(
    createInitialChartDataState()
  );
  const [fetchErrors, setFetchErrors] = useState<Record<string, string>>({});

  const chartTickers = useAppSelector(selectChartTickers);
  const selectedStocks = useAppSelector(selectStocksSelected);
  const fromDate = useAppSelector(selectFromDate);
  const toDate = useAppSelector(selectToDate);
  const priceOption = useAppSelector(selectPriceOption);

  const isInitialMount = useRef(true);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const loadData = async (ticker: string, from: string = fromDate, to: string = toDate) => {
    try {
      const response = await getStockData({ ticker, from, to }).unwrap();
      updateChartData(response.ticker, response.results);

      // Clear any previous error for this ticker
      setFetchErrors(prev => {
        const updated = { ...prev };
        delete updated[ticker];
        return updated;
      });
    }
    catch (error) {
      // Store the error for this ticker
      setFetchErrors(prev => ({
        ...prev,
        [ticker]: error instanceof Error ? error.message : 'Failed to fetch data'
      }));
    }
  };

  const updateChartData = (ticker: string, results: StockData[]) => {
    setChartData(prev => {
      const updated = { ...prev };
      removeTransformedDataByTicker(updated, ticker);
      
      chartPriceOptions.forEach(option => {
        updated[option].push({
          type: 'line',
          name: ticker,
          data: dataTransform(
            results,
            PRICE_SERIES_CODES[option.toUpperCase() as keyof typeof PRICE_SERIES_CODES]
          )
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
          loadData(ticker).then(() => dispatch(tickersUpdated(ticker)))
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

      tickersToRemove.forEach(ticker => dispatch(tickersUpdated(ticker)));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStocks]);

  if (result.isError) {
    return (
      <div className="chart">
        <div className="chartMsg">{result.error.toString()}</div>
      </div>
    );
  }

  if (chartTickers.length === 0 && Object.keys(fetchErrors).length === 0) {
    return (
      <div className="chart">
        <div className="chartMsg">Awaiting data</div>
      </div>
    );
  }

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'line',
    },
    title: {
      text: `${priceOption} Price over time`
    },
    xAxis: {
      type: 'datetime'
    },
    yAxis: {
      title: {
        text: 'Price (USD)'
      }
    },
    legend: {
      enabled: true
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false
        },
      }
    },
    // Gave up trying to fix the typescript issue here and bypassed it
    // @ts-ignore comment
    series: chartData[priceOption]
  };

  return (
    <div className="chart" data-testid='stockchart'>
      {Object.keys(fetchErrors).length > 0 && (
        <div className="chart-errors">
          {Object.entries(fetchErrors).map(([ticker, error]) => (
            <div key={ticker} className="error-message">
              ⚠️ Failed to load {ticker}: {error}
            </div>
          ))}
        </div>
      )}

      {chartTickers.length > 0 && (
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          ref={chartComponentRef}
        />
      )}
    </div>
  )
}

export default StockChart;
