import { useEffect, useRef } from "react";
import * as Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectPriceOption } from "../PriceOptions/priceOptionsSlice";
import { selectFromDate, selectToDate } from "../DateSelector/dateSelectorSlice";
import { selectChartStatus, selectChartError, fetchChartData, selectChartData, selectChartTickers } from "./stockChartSlice";
import { selectStocksSelected } from "../StockList/stockListSlice";
import './StockChart.css';

function StockChart() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectChartData);
  const existingChartTickers = new Set(useAppSelector(selectChartTickers));
  const status = useAppSelector(selectChartStatus);
  const error = useAppSelector(selectChartError);

  const selectedStocks = useAppSelector(selectStocksSelected);
  const fromDate = useAppSelector(selectFromDate);
  const toDate = useAppSelector(selectToDate);
  const priceOption = useAppSelector(selectPriceOption);

  const isInitialMount = useRef(true);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const loadData = async (ticker: string, from: string = fromDate, to: string = toDate) => {
    dispatch(fetchChartData({ ticker, from, to }));
  }

  useEffect(() => {
    if (selectedStocks.length === 0) {
      return;
    }

    // Only fetch data for tickers not already in our array
    // data removal and chart visiblity is handled in the slice
    selectedStocks
      .filter(ticker => !existingChartTickers.has(ticker))
      .forEach(ticker => loadData(ticker));

      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStocks, dispatch]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (selectedStocks.length > 0) {
      selectedStocks.forEach(ticker => loadData(ticker, fromDate, toDate));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  if (status === 'rejected') {
    return (
      <div className="chart">
        <div className="chartMsg">{error}</div>
      </div>
    );
  }

  if (status === 'pending') {
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
    series: data[priceOption]
  };

  return (
    <div className="chart" data-testid='stockchart'>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        ref={chartComponentRef}
      />
    </div>
  )
}

export default StockChart;
