import { ChangeEvent, useRef, useState } from 'react';
import { TextField } from '@mui/material';
import { useAppDispatch } from '../../app/hooks';
import { datesUpdated } from './dateSelectorSlice';
import { DATE_MAX, DATE_MIN } from '../../constants';
import './DateSelector.css';

function DateSelector() {
  const [dateError, setDateError] = useState<false | string>(false);
  const fromDateEl = useRef<HTMLInputElement>(null);
  const toDateEl = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

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
      // dispatching both here because if the user changed one date resulting in failed validation and
      // then changed the other date resulting in failing passing then both will need to be dispatched
      setDateError(false);
      dispatch(datesUpdated({fromDate, toDate}));
    }
  }

  return (
    <>
      <div className='dates-group'>
        <TextField
          id='from-date'
          label='From date'
          type='date'
          slotProps={{htmlInput: { ref: fromDateEl, min: DATE_MIN, max: DATE_MAX, 'data-source': 'from', 'data-testid': 'from-date'}, inputLabel: { shrink: true }}}
          onChange={handleDateChange}
          defaultValue={DATE_MIN}
        />
        <TextField
          id='to-date'
          label='To date'
          type='date'
          slotProps={{htmlInput: { ref: toDateEl, min: DATE_MIN, max: DATE_MAX, 'data-source': 'to', 'data-testid': 'to-date'}, inputLabel: { shrink: true }}}
          onChange={handleDateChange}
          defaultValue={DATE_MAX}
        />
      </div>
      {dateError && (<div className='dates-error'>{dateError}</div>)}
    </>
  );
}

export default DateSelector;
