import { ChangeEvent, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, RadioInputSlotPropsOverrides, TextField } from "@mui/material";
import { setFromDate, setToDate, setChartPricingOption } from "../../actions";
import { DATE_MAX, DATE_MIN } from "../../constants";
import './ChartOptions.css';

export const chartPriceOptions = ['Close', 'High', 'Low', 'Open'] as const;

interface MyRadioInputSlotPropsOverrides extends RadioInputSlotPropsOverrides {
  "data-testid"?: string;
}

function ChartOptions() {
  const [dateError, setDateError] = useState<false | string>(false);
  const fromDateEl = useRef<HTMLInputElement>(null);
  const toDateEl = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const handlePriceOptionChange = (e: ChangeEvent<HTMLInputElement>): void => {
    dispatch(setChartPricingOption(e.target.value as ChartPriceOptions));
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newDate = e.target.value;
    const source = e.target.dataset.source;
    const fromDate = fromDateEl?.current?.value || DATE_MIN;
    const toDate = toDateEl?.current?.value || DATE_MAX;

    if (newDate < DATE_MIN || newDate > DATE_MAX) {
      setDateError(`Date should between ${DATE_MIN} and ${DATE_MAX}`);
    } else if (source === 'from' && newDate >= toDate) {
      setDateError('The from date should be before the to date');
    } else if (source === 'to' && newDate <= fromDate) {
      setDateError('The to date should be after the from date');
    } else {
      setDateError(false);
      dispatch(setFromDate(fromDate));
      dispatch(setToDate(toDate));
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
          onChange={handlePriceOptionChange}
          defaultValue={chartPriceOptions[0]}
        >
          {chartPriceOptions.map((option: ChartPriceOptions, index) => {
            return (
              <FormControlLabel
                key={index}
                control={<Radio slotProps={{input: { "data-testid": `radio-${option}` } as MyRadioInputSlotPropsOverrides}} />}
                label={option}
                value={option}
              />
              )
            })}
        </RadioGroup>
      </FormControl>

      <div className="dates-group">
        <TextField
          id="from-date"
          label="From date"
          type="date"
          slotProps={{htmlInput: { ref: fromDateEl, min: DATE_MIN, max: DATE_MAX, "data-source": "from", "data-testid": "from-date"}, inputLabel: { shrink: true }}}
          onChange={handleDateChange}
          defaultValue={DATE_MIN}
        />
        <TextField
          id="to-date"
          label="To date"
          type="date"
          slotProps={{htmlInput: { ref: toDateEl, min: DATE_MIN, max: DATE_MAX, "data-source": "to", "data-testid": "to-date"}, inputLabel: { shrink: true }}}
          onChange={handleDateChange}
          defaultValue={DATE_MAX}
        />
      </div>
      {dateError && (<div className="dates-error">{dateError}</div>)}
    </div>
  );
}

export default ChartOptions;
