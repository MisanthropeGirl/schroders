import React, { useEffect, useRef, useState } from "react";
import { format, subYears } from 'date-fns';
import { dataFetch } from '../../utilities';
import { POLYGON_DATA_URL, PRICE_SERIES_CODES } from "../../constants";
import * as Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import './StockChart.css';

interface StockChartProps {
  newTicker: string;
  removedTicker: string;
  selectedTickers: string[];
  priceOption: string;
}

interface RawData {
  ticker: string;
  data: StockData[];
}

interface ChartData {
  name: string;
  type: string;
  data: [number, number][];
}

function StockChart({ newTicker, removedTicker, selectedTickers, priceOption }: StockChartProps) {
  const [data, setData] = useState<RawData[]>([]);
  const [error, setError] = useState<boolean | string>(false);
  const [loading, setLoading] = useState(true);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  // only have access to the last two years
  const toDate = format(new Date(), 'yyyy-MM-dd');
  const fromDate = format(subYears(toDate, 1), 'yyyy-MM-dd');

  useEffect(() => {
    const loadData = async () => {
      try {
        const stockData = await dataFetch(
          `${POLYGON_DATA_URL}/${newTicker}/range/1/day/${fromDate}/${toDate}`,
          {
            adjusted: true,
            sort: 'asc',
          }
        );

        setData(d => { return [...d, { 'ticker': newTicker, data: stockData.results }]});
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

    if (newTicker !== '') {
      loadData();
    }
  }, [fromDate, toDate, newTicker]);

  useEffect(() => {
    if (removedTicker !== '') {
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
      zooming: {
        type: 'x'
      }
    },
    title: {
      text: `${priceOption} Price over time`
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
