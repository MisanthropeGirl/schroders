import React, { useEffect, useRef, useState } from "react";
import { dataFetch, dataTransform } from '../../utilities';
import { POLYGON_DATA_URL, PRICE_SERIES_CODES } from "../../constants";
import * as Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import './StockChart.css';
import { useSelector } from "react-redux";
import { selectFromDate, selectNewTicker, selectPriceOption, selectRemovedTicker, selectSelectedTickers, selectToDate } from "../../selectors";

function StockChart() {
  const [data, setData] = useState<RawChartData[]>([]);
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
    try {
      const stockData = await dataFetch(
        `${POLYGON_DATA_URL}/${ticker}/range/1/day/${from}/${to}`,
        {
          adjusted: true,
          sort: 'asc',
        }
      );
        
      // remove existing data for the ticker
      const temp = data.findIndex(d => d.ticker === ticker) > -1
        ? data.filter(d => d.ticker !== ticker)
        : data;
      setData([...temp, { ticker, data: stockData.results }]);
      setError(false);
    }
    catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('There was an error. Please refer to the console.');
      }
      setData([]);
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (newTicker && newTicker !== '') {
      loadData(newTicker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newTicker]);

  useEffect(() => {
    if (selectedTickers.length > 0) {
      selectedTickers.forEach(ticker => loadData(ticker, fromDate, toDate));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  useEffect(() => {
    if (removedTicker && removedTicker !== '') {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setData(d => d.filter(it => it.ticker !== removedTicker));
    }
  }, [removedTicker]);

  useEffect(() => {
    if (data.length === 0) {
      setLoading(true);
    }
  }, [data])

  if (loading) {
    return (
      <div className="chart">
        <div className="chartMsg">Awaiting data</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart">
        <div className="chartMsg">{error}</div>
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
