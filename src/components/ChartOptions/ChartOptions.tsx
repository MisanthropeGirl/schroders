import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import './ChartOptions.css';

function ChartOptions() {
  const options = ['Close', 'High', 'Low', 'Open'];

  return (
    <FormControl className="option-group">
      <FormLabel id="radio-buttons-group-label">View prices for day…</FormLabel>
      <RadioGroup
        row
        aria-labelledby="radio-buttons-group-label"
        name="row-radio-buttons-group"
      >
        {options.map(option => {
          return (
            <FormControlLabel value={option.toLowerCase()} control={<Radio />} label={option} />
          )
        })}
      </RadioGroup>
    </FormControl>
  );
}

export default ChartOptions;