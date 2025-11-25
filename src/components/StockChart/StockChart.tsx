import { useEffect, useRef } from "react";
import * as Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { PRICE_SERIES_CODES } from "../../constants";
import { dataTransform } from '../../utilities';
import { selectPriceOption } from "../PriceOptions/priceOptionsSlice";
import { selectFromDate, selectToDate } from "../DateSelector/dateSelectorSlice";
import { selectChartStatus, selectChartError, fetchChartData, selectChartData } from "./stockChartSlice";
import { selectStocksSelected } from "../StockList/stockListSlice";
import './StockChart.css';

function StockChart() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectChartData);
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
    // loop through selected tickers and if there isn't a corresponding entry in
    // data then fetch data for that ticker
    // data removal and chart visiblity is handled in the slice
    selectedStocks.forEach(ticker => {
      if (data.findIndex(d => d.ticker === ticker) === -1) {
        loadData(ticker);
      }
    });
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

  const transformedData: { [key: string]: ChartData[] } = {};
  transformedData['Open'] = dataTransform(data, PRICE_SERIES_CODES.OPEN);
  transformedData['High'] = dataTransform(data, PRICE_SERIES_CODES.HIGH);
  transformedData['Low'] = dataTransform(data, PRICE_SERIES_CODES.LOW);
  transformedData['Close'] = dataTransform(data, PRICE_SERIES_CODES.CLOSE);

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
    series: transformedData[priceOption]
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
