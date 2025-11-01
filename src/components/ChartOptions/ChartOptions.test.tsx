import { ReactElement } from 'react';
import userEvent from '@testing-library/user-event';
import { addDays, addYears, format, subDays } from 'date-fns';
import ChartOptions from './ChartOptions';
import { DATE_MAX, DATE_MIDDLE, DATE_MIN } from '../../constants';
import { render, screen } from '../../test-utils';

const DATE_MIDDLE_PLUS_ONE_DAY = format(addDays(DATE_MIDDLE, 1), 'yyyy-MM-dd');
const DATE_MIDDLE_MINUS_ONE_DAY = format(subDays(DATE_MIDDLE, 1), 'yyyy-MM-dd');

// setup function
function setup(tsx: ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(tsx),
  }
}
describe('ChartOptions', () => {
  test('it renders without crashing', () => {
    render(<ChartOptions/>);
  });

  test('it renders and initialises the from date element correctly', () => {
    render(<ChartOptions/>);

    const fromDate = screen.getByTestId('from-date');

    expect(fromDate).toHaveAttribute('type', 'date');
    expect(fromDate).toHaveAttribute('min', DATE_MIN);
    expect(fromDate).toHaveAttribute('max', DATE_MAX);
    expect(fromDate).toHaveAttribute('value', DATE_MIN);
  });

  test('it renders and initialises the to date element correctly', () => {
    render(<ChartOptions/>);

    const toDate = screen.getByTestId('to-date');

    expect(toDate).toHaveAttribute('type', 'date');
    expect(toDate).toHaveAttribute('min', DATE_MIN);
    expect(toDate).toHaveAttribute('max', DATE_MAX);
    expect(toDate).toHaveAttribute('value', DATE_MAX);
  });

  test('it renders four price options, the first of which should be checked', () => {
    render(<ChartOptions/>);

    const radioGroup = screen.getByRole('radiogroup');

    expect(radioGroup.children).toHaveLength(4);

    expect(radioGroup.children[0].lastElementChild).toHaveTextContent('Close');
    expect(radioGroup.children[1].lastElementChild).toHaveTextContent('High');
    expect(radioGroup.children[2].lastElementChild).toHaveTextContent('Low');
    expect(radioGroup.children[3].lastElementChild).toHaveTextContent('Open');

    expect(screen.getByRole('radio', { name: 'Select Close' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Select High' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Select Low' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Select Open' })).toBeInTheDocument();

    const radioClose = screen.getByTestId('radio-Close');

    expect(radioClose).toBeChecked();
  });

  test('it should throw a date out of range error', async () => {
    const { user } = setup(<ChartOptions />);

    const fromDate = screen.getByTestId('from-date');

    expect(screen.queryByText(`Date should between ${DATE_MIN} and ${DATE_MAX}`)).not.toBeInTheDocument();

    await user.clear(fromDate);
    await user.type(fromDate, '1999-12-31');

    expect(screen.queryByText(`Date should between ${DATE_MIN} and ${DATE_MAX}`)).toBeInTheDocument();

    await user.clear(fromDate);
    await user.type(fromDate, DATE_MIN);

    expect(screen.queryByText(`Date should between ${DATE_MIN} and ${DATE_MAX}`)).not.toBeInTheDocument();

  });

  test('it should throw a min date is after max date error', async () => {
    const { user } = setup(<ChartOptions />);

    const fromDate = screen.getByTestId('from-date');
    const toDate = screen.getByTestId('to-date');

    expect(screen.queryByText('The from date should be before the to date')).not.toBeInTheDocument();

    await user.clear(fromDate);
    await user.type(fromDate, DATE_MAX);

    expect(screen.queryByText('The from date should be before the to date')).toBeInTheDocument();

    await user.clear(fromDate);
    await user.type(fromDate, DATE_MIN);

    expect(screen.queryByText('The from date should be before the to date')).not.toBeInTheDocument();

    await user.clear(toDate);
    await user.type(toDate, DATE_MIDDLE);

    await user.clear(fromDate);
    await user.type(fromDate, DATE_MIDDLE_PLUS_ONE_DAY);

    expect(screen.queryByText('The from date should be before the to date')).toBeInTheDocument();

    await user.clear(fromDate);
    await user.type(fromDate, DATE_MIDDLE_MINUS_ONE_DAY);

    expect(screen.queryByText('The from date should be before the to date')).not.toBeInTheDocument();
  });

  test('it should throw a max date is before min date error', async () => {
    const { user } = setup(<ChartOptions />);

    const fromDate = screen.getByTestId('from-date');
    const toDate = screen.getByTestId('to-date');

    expect(screen.queryByText('The to date should be after the from date')).not.toBeInTheDocument();

    await user.clear(toDate);
    await user.type(toDate, DATE_MIN);

    expect(screen.queryByText('The to date should be after the from date')).toBeInTheDocument();

    await user.clear(toDate);
    await user.type(toDate, DATE_MAX);

    expect(screen.queryByText('The to date should be after the from date')).not.toBeInTheDocument();

    await user.clear(fromDate);
    await user.type(fromDate, DATE_MIDDLE);

    await user.clear(toDate);
    await user.type(toDate, DATE_MIDDLE_MINUS_ONE_DAY);

    expect(screen.queryByText('The to date should be after the from date')).toBeInTheDocument();

    await user.clear(toDate);
    await user.type(toDate, DATE_MIDDLE_PLUS_ONE_DAY);

    expect(screen.queryByText('The to date should be after the from date')).not.toBeInTheDocument();
  });

  test('it should throw error when from date equals to date', async () => {
    const { user } = setup(<ChartOptions />);
  
    const fromDate = screen.getByTestId('from-date');
    const toDate = screen.getByTestId('to-date');
  
    await user.clear(toDate);
    await user.type(toDate, DATE_MIDDLE);
  
    await user.clear(fromDate);
    await user.type(fromDate, DATE_MIDDLE); // Same as toDate
  
    expect(screen.getByText('The from date should be before the to date')).toBeInTheDocument();
  });

  test('it should throw error when to date equals from date', async () => {
    const { user } = setup(<ChartOptions />);
  
    const fromDate = screen.getByTestId('from-date');
    const toDate = screen.getByTestId('to-date');
  
    await user.clear(fromDate);
    await user.type(fromDate, DATE_MIDDLE); // Same as toDate
  
    await user.clear(toDate);
    await user.type(toDate, DATE_MIDDLE);
  
    expect(screen.getByText('The to date should be after the from date')).toBeInTheDocument();
  });

  test('it updates fromDate in store when valid date is entered', async () => {
    const { user, store } = setup(<ChartOptions />);
  
    const fromDate = screen.getByTestId('from-date');
    
    await user.clear(fromDate);
    await user.type(fromDate, DATE_MIDDLE);
  
    expect(store.getState().fromDate).toBe(DATE_MIDDLE);
    expect(screen.queryByText('The from date should be before the to date')).not.toBeInTheDocument();
  });
  
  test('it updates toDate in store when valid date is entered', async () => {
    const { user, store } = setup(<ChartOptions />);
  
    const toDate = screen.getByTestId('to-date');
    
    await user.clear(toDate);
    await user.type(toDate, DATE_MIDDLE);
  
    expect(store.getState().toDate).toBe(DATE_MIDDLE);
    expect(screen.queryByText('The to date should be after the from date')).not.toBeInTheDocument();
  });

  test('it dispatches both dates when validation passes after a previous error', async () => {
    const { user, store } = setup(<ChartOptions />);
  
    const fromDate = screen.getByTestId('from-date');
    const toDate = screen.getByTestId('to-date');
  
    // Initial state
    expect(store.getState().fromDate).toBe(DATE_MIN);
    expect(store.getState().toDate).toBe(DATE_MAX);
  
    // Step 1: Change toDate to middle (valid)
    await user.clear(toDate);
    await user.type(toDate, DATE_MIDDLE);
  
    expect(store.getState().toDate).toBe(DATE_MIDDLE);
  
    // Step 2: Change fromDate to after toDate (invalid - should NOT dispatch)
    await user.clear(fromDate);
    await user.type(fromDate, DATE_MIDDLE_PLUS_ONE_DAY);
  
    expect(screen.getByText('The from date should be before the to date')).toBeInTheDocument();
    // Redux should still have old fromDate
    expect(store.getState().fromDate).toBe(DATE_MIN);
  
    // Step 3: Fix toDate to be after the new fromDate (valid again)
    await user.clear(toDate);
    await user.type(toDate, DATE_MAX);
  
    // Now BOTH dates should be in Redux
    expect(store.getState().fromDate).toBe(DATE_MIDDLE_PLUS_ONE_DAY);
    expect(store.getState().toDate).toBe(DATE_MAX);
    expect(screen.queryByText('The from date should be before the to date')).not.toBeInTheDocument();
  });

  test('it changes the pricing option', async () => {
    const { user, store } = setup(<ChartOptions />);

    const radioClose = screen.getByTestId('radio-Close');
    const radioOpen = screen.getByTestId('radio-Open');

    expect(radioClose).toBeChecked();
    expect(radioOpen).not.toBeChecked();

    await user.click(radioOpen);

    expect(radioOpen).toBeChecked();
    expect(radioClose).not.toBeChecked();
    expect(store.getState().priceOption).toBe('Open');
  });
});
