import { useDispatch } from "react-redux";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from "@mui/material";
import { setFromDate, setToDate, setChartPricingOption } from "../../actions";
import { DATE_MAX, DATE_MIN } from "../../constants";
import './ChartOptions.css';

export const chartPriceOptions = ['Close', 'High', 'Low', 'Open'] as const;

function ChartOptions() {
  const dispatch = useDispatch();
  
  return (
    <div className="container">
      <FormControl className="option-group">
        <FormLabel id="radio-buttons-group-label">View prices for day…</FormLabel>
        <RadioGroup
          row
          aria-labelledby="radio-buttons-group-label"
          name="row-radio-buttons-group"
          onChange={e => dispatch(setChartPricingOption(e.target.value as ChartPriceOptions))}
          defaultValue={chartPriceOptions[0]}
          >
          {chartPriceOptions.map((option: ChartPriceOptions, index) => {
            return (
              <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
              )
            })}
        </RadioGroup>
      </FormControl>
      
      <div className="dates-group">
        <TextField
          id="from-date"
          label="From date"
          type="date"
          slotProps={{htmlInput: { min: DATE_MIN, max: DATE_MAX}, inputLabel: { shrink: true }}}
          onChange={e => dispatch(setFromDate(e.target.value))}
          defaultValue={DATE_MIN}
        />
        <TextField
          id="to-date"
          label="To date"
          type="date"
          slotProps={{htmlInput: { min: DATE_MIN, max: DATE_MAX}, inputLabel: { shrink: true }}}
          onChange={e => dispatch(setToDate(e.target.value))}
          defaultValue={DATE_MAX}
        />
      </div>
    </div>
  );
}

export default ChartOptions;