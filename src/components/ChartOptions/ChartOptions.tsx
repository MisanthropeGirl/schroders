import { ChangeEvent } from "react";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import './ChartOptions.css';

interface ChartOptionsProps {
  changePriceOption: (e: ChangeEvent<HTMLInputElement>) => void;
}

function ChartOptions({ changePriceOption }: ChartOptionsProps) {
  const options = ['Close', 'High', 'Low', 'Open'];

  return (
    <FormControl className="option-group">
      <FormLabel id="radio-buttons-group-label">View prices for day…</FormLabel>
      <RadioGroup
        row
        aria-labelledby="radio-buttons-group-label"
        name="row-radio-buttons-group"
        onChange={changePriceOption}
        defaultValue={options[0]}
      >
        {options.map((option, index) => {
          return (
            <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
          )
        })}
      </RadioGroup>
    </FormControl>
  );
}

export default ChartOptions;