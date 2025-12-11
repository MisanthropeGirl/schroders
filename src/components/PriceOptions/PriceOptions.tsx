import { ChangeEvent } from "react";
import { RadioInputSlotPropsOverrides } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { useAppDispatch } from "../../app/hooks";
import { ChartPriceOptions, priceOptionUpdated } from "./priceOptionsSlice";
import { chartPriceOptions } from "../../constants";
import "./PriceOptions.css";

interface MyRadioInputSlotPropsOverrides extends RadioInputSlotPropsOverrides {
  "data-testid"?: string;
}

function PriceOptions() {
  const dispatch = useAppDispatch();

  const handlePriceOptionChange = (e: ChangeEvent<HTMLInputElement>): void => {
    dispatch(priceOptionUpdated(e.target.value as ChartPriceOptions));
  };

  return (
    <FormControl className="option-group">
      <FormLabel id="radio-buttons-group-label">View prices for day…</FormLabel>
      <RadioGroup
        row
        aria-labelledby="radio-buttons-group-label"
        name="row-radio-buttons-group"
        onChange={handlePriceOptionChange}
        defaultValue={chartPriceOptions[0]}
      >
        {chartPriceOptions.map((option: ChartPriceOptions) => (
          <FormControlLabel
            key={option}
            control={
              <Radio
                slotProps={{
                  input: {
                    "aria-label": `Select ${option}`,
                    "data-testid": `radio-${option}`,
                  } as MyRadioInputSlotPropsOverrides,
                }}
              />
            }
            label={option}
            value={option}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

export default PriceOptions;
