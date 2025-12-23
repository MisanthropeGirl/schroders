import { useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { dataFetch, dataTransform } from "../../utilities";
import { POLYGON_DATA_URL, PRICE_SERIES_CODES } from "../../constants";
import * as Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import "./StockChart.css";
import { useSelector } from "react-redux";
import {
  selectFromDate,
  selectPriceOption,
  selectSelectedTickers,
  selectToDate,
} from "../../selectors";

function StockChart() {
  const [data, setData] = useImmer<RawChartData[]>([]);
  const [error, setError] = useState<boolean | string>(false);
  const [loading, setLoading] = useState(true);

  const selectedTickers = useSelector(selectSelectedTickers);
  const fromDate = useSelector(selectFromDate);
  const toDate = useSelector(selectToDate);
  const priceOption = useSelector(selectPriceOption);

  const isInitialMount = useRef(true);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const loadData = async (ticker: string, from: string = fromDate, to: string = toDate) => {
    try {
      const stockData = await dataFetch(`${POLYGON_DATA_URL}/${ticker}/range/1/day/${from}/${to}`, {
        adjusted: true,
        sort: "asc",
      });

      setData(draft => {
        const tickerIndex = draft.findIndex(it => it.ticker === ticker);
        if (tickerIndex > -1) {
          draft[tickerIndex].data = stockData.results;
        } else {
          draft.push({ ticker, data: stockData.results });
        }
      });
      setError(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("There was an error. Please refer to the console.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTickers.length === 0) {
      setLoading(true);
      return;
    }

    // loop through selected tickers and if there isn't a corresponding entry in
    // data then fetch data for that ticker
    selectedTickers.forEach(ticker => {
      if (data.findIndex(d => d.ticker === ticker) === -1) {
        loadData(ticker);
      }
    });

    // loop over data and see if there is a match in selectedTickers
    // remove the entry if there isn't
    let removedTicker = "";
    data.forEach(it => {
      if (!selectedTickers.includes(it.ticker)) {
        removedTicker = it.ticker;
      }
    });
    if (removedTicker !== "") {
      setData(data => data.filter(d => d.ticker !== removedTicker));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTickers]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (selectedTickers.length > 0) {
      selectedTickers.forEach(ticker => loadData(ticker, fromDate, toDate));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

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
  transformedData["Open"] = dataTransform(data, PRICE_SERIES_CODES.OPEN);
  transformedData["High"] = dataTransform(data, PRICE_SERIES_CODES.HIGH);
  transformedData["Low"] = dataTransform(data, PRICE_SERIES_CODES.LOW);
  transformedData["Close"] = dataTransform(data, PRICE_SERIES_CODES.CLOSE);

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "line",
    },
    title: {
      text: `${priceOption} Price over time`,
    },
    xAxis: {
      type: "datetime",
    },
    yAxis: {
      title: {
        text: "Price (USD)",
      },
    },
    legend: {
      enabled: true,
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
      },
    },
    // Gave up trying to fix the typescript issue here and bypassed it
    // @ts-ignore comment
    series: transformedData[priceOption],
  };

  return (
    <div className="chart" data-testid="stockchart">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartComponentRef} />
    </div>
  );
}

export default StockChart;
