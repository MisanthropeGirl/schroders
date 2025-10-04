import React, { useEffect, useRef, useState } from "react";
import { dataFetch } from '../../utilities';
import { POLYGON_DATA_URL, PRICE_SERIES_CODES } from "../../constants";
import * as Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import './StockChart.css';
import { useSelector } from "react-redux";
import { selectFromDate, selectNewTicker, selectPriceOption, selectRemovedTicker, selectSelectedTickers, selectToDate } from "../../selectors";

interface RawData {
  ticker: string;
  data: StockData[];
}

interface ChartData {
  name: string;
  type: string;
  data: [number, number][];
}

function StockChart() {
  const [data, setData] = useState<RawData[]>([]);
  const [error, setError] = useState<boolean | string>(false);
  const [loading, setLoading] = useState(true);

  const newTicker = useSelector(selectNewTicker);
  const removedTicker = useSelector(selectRemovedTicker);
  const selectedTickers = useSelector(selectSelectedTickers);
  const fromDate = useSelector(selectFromDate);
  const toDate = useSelector(selectToDate);
  const priceOption = useSelector(selectPriceOption);

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const loadData = async (ticker: string, from: string = fromDate, to: string = toDate) => {
    if (ticker === '') return;
    try {
      const stockData = await dataFetch(
        `${POLYGON_DATA_URL}/${ticker}/range/1/day/${from}/${to}`,
        {
          adjusted: true,
          sort: 'asc',
        }
      );

      setData(data => { return [...data, { 'ticker': ticker, data: stockData.results }]});
      setError(false);
    }
    catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(true);
        throw err;
      }
      setData([]);
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (newTicker) {
      loadData(newTicker);
    }
  }, [newTicker]);

  useEffect(() => {
    setData([]);
    selectedTickers.map(ticker => loadData(ticker, fromDate, toDate));
  }, [fromDate, toDate]);

  useEffect(() => {
    if (removedTicker && removedTicker !== '') {
      setData(d => d.filter(it => it.ticker !== removedTicker));
    }
  }, [removedTicker]);

  if (loading) {
    return (
      <div className="chart">
        <div className="chartMsg">Awaiting data…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart">
        <div className="chartMsg">
          {(typeof error === 'string') ? error : 'There was an error. Please refer to the console.'}
        </div>
      </div>
    );
  }

  const transformData = (key: string): ChartData[] => {
    return data.map(stock => {
      return ({
        type: 'line',
        'name': stock.ticker,
        'data': stock.data.map(it => [
          it[PRICE_SERIES_CODES.TIME as keyof StockData] as number,
          it[key as keyof StockData] as number
        ])
      })
    });
  }

  const transformedData: { [key: string]: ChartData[] } = {};
  transformedData['Close'] = transformData(PRICE_SERIES_CODES.CLOSE);
  transformedData['High'] = transformData(PRICE_SERIES_CODES.HIGH);
  transformedData['Low'] = transformData(PRICE_SERIES_CODES.LOW);
  transformedData['Open'] = transformData(PRICE_SERIES_CODES.OPEN);

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
    <div className="chart">
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        ref={chartComponentRef}
      />
    </div>
  )
}

export default StockChart;
