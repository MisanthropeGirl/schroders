import { ChangeEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from "@mui/material";
import { setFromDate, setToDate, setChartPricingOption } from "../../actions";
import { DATE_MAX, DATE_MIN } from "../../constants";
import { selectFromDate, selectToDate } from "../../selectors";
import './ChartOptions.css';

export const chartPriceOptions = ['Close', 'High', 'Low', 'Open'] as const;

function ChartOptions() {
  const [dateError, setDateError] = useState<false | string>(false);
  const fromDate = useSelector(selectFromDate);
  const toDate = useSelector(selectToDate);
  const dispatch = useDispatch();

  const handleDateChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, which: 'from' | 'to'): void => {
    const newDate = e.target.value;
    if (newDate < DATE_MIN || newDate > DATE_MAX) {
      setDateError(`Date should between ${DATE_MIN} and ${DATE_MAX}`);
    } else if (which === 'from' && newDate > toDate) {
      setDateError('The from date should be before the to date');
    } else if (which === 'to' && newDate < fromDate) {
      setDateError('The to date should be after the from date');
    } else {
      setDateError(false);
      dispatch(which === 'from' ? setFromDate(newDate) : setToDate(newDate));
    }
  }

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
          onChange={e => handleDateChange(e, 'from')}
          defaultValue={DATE_MIN}
        />
        <TextField
          id="to-date"
          label="To date"
          type="date"
          slotProps={{htmlInput: { min: DATE_MIN, max: DATE_MAX}, inputLabel: { shrink: true }}}
          onChange={e => handleDateChange(e, 'to')}
          defaultValue={DATE_MAX}
        />
      </div>
      {dateError && (<div className="dates-error">{dateError}</div>)}
    </div>
  );
}

export default ChartOptions;