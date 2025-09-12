import React, { useEffect, useRef, useState } from "react";
import { format, subYears } from 'date-fns';
import { dataFetch } from '../../utilities';
import { POLYGON_DATA_URL, PRICE_SERIES_CODES } from "../../constants";
import * as Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import './StockChart.css';

interface RawData {
  ticker: string;
  data: StockData[];
}

interface TransformedData {
  name: string;
  type: string;
  data: [number, number][];
}

function StockChart() {
  const [data, setData] = useState<RawData[]>([]);
  const [error, setError] = useState<boolean | string>(false);
  const [loading, setLoading] = useState(true);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  // only have access to the last two years
  const toDate = format(new Date(), 'yyyy-MM-dd');
  const fromDate = format(subYears(toDate, 1), 'yyyy-MM-dd');

  useEffect(() => {
    const loadData = async (ticker: string) => {
      try {
        const stockData = await dataFetch(
          `${POLYGON_DATA_URL}/${ticker}/range/1/day/${fromDate}/${toDate}`,
          {
            adjusted: true,
            sort: 'asc',
          }
        );

        setData(d => { return [...d, { 'ticker': ticker, data: stockData.results }]});
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

    const tickers = ['AAPL', 'AMZN', 'GOOG'];
    setData([]);
    tickers.forEach(ticker => {
      loadData(ticker);
    })
  }, [fromDate, toDate]);

  if (loading) {
    return (
      <div className="chart">
        <div className="chartMsg">Loading chart</div>
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

  const transformData = (key: string): TransformedData[] => {
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

  const closeData = transformData(PRICE_SERIES_CODES.CLOSE);
  const highData = transformData(PRICE_SERIES_CODES.HIGH);
  const lowData = transformData(PRICE_SERIES_CODES.LOW);
  const openData = transformData(PRICE_SERIES_CODES.OPEN);

  const options: Highcharts.Options = {
    chart: {
      type: 'line',
      zooming: {
        type: 'x'
      }
    },
    title: {
      text: 'Closing Price over time'
    },
    subtitle: {
      text: document.ontouchstart === undefined ?
        'Click and drag in the plot area to zoom in' :
        'Pinch the chart to zoom in'
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
    series: closeData
  };

  return (
    <div className="chart">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartComponentRef}
        />
    </div>
  )
}

export default StockChart;
