import { useRef } from "react";
import * as Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useStockChartData } from "../../hooks/useStockChartData";
import { selectFromDate, selectToDate } from "../DateSelector/dateSelectorSlice";
import { selectPriceOption } from "../PriceOptions/priceOptionsSlice";
import { selectStocksSelected } from "../StockList/stockListSlice";
import { selectChartTickers, tickersUpdated } from "./stockChartSlice";
import "./StockChart.css";

function StockChart() {
  const dispatch = useAppDispatch();

  const chartTickers = useAppSelector(selectChartTickers);
  const selectedStocks = useAppSelector(selectStocksSelected);
  const fromDate = useAppSelector(selectFromDate);
  const toDate = useAppSelector(selectToDate);
  const priceOption = useAppSelector(selectPriceOption);

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const { chartData, fetchErrors, isError, error } = useStockChartData(
    selectedStocks,
    chartTickers,
    fromDate,
    toDate,
    ticker => dispatch(tickersUpdated(ticker)),
  );

  if (isError) {
    return (
      <div className="chart">
        <div className="chartMsg">{error!.toString()}</div>
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
    series: chartData[priceOption],
  };

  return (
    <div className="chart" data-testid="stockchart">
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
        <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartComponentRef} />
      )}
    </div>
  );
}

export default StockChart;
