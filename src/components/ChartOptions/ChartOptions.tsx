import DateSelector from "../DateSelector/DateSelector";
import PriceOptions from "../PriceOptions/PriceOptions";
import "./ChartOptions.css";

function ChartOptions() {
  return (
    <div className="container">
      <PriceOptions />
      <DateSelector />
    </div>
  );
}

export default ChartOptions;
