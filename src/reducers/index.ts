import { AnyAction } from 'redux';
import { produce } from 'immer';
import { ACTION_TYPES, DATE_MAX, DATE_MIN } from "../constants";
import { chartPriceOptions } from '../components/ChartOptions/ChartOptions';

const initialState: Store = {
  priceOption: chartPriceOptions[0],
  fromDate: DATE_MIN,
  toDate: DATE_MAX,
  selectedTickers: []
};

const reducer = (state: Store = initialState, action: AnyAction): Store => {
  return produce(state, draft => {
    switch (action.type) {
      case ACTION_TYPES.SET_FROM_DATE:
        draft.fromDate = action.payload;
        break;
      case ACTION_TYPES.SET_TO_DATE:
        draft.toDate = action.payload;
        break;
      case ACTION_TYPES.SET_CHART_PRICING_OPTION:
        draft.priceOption = action.payload;
        break;
      case ACTION_TYPES.SET_NEW_TICKER:
        draft.newTicker = action.payload;
        break;
      case ACTION_TYPES.SET_REMOVED_TICKER:
        draft.removedTicker = action.payload;
        break;
      case ACTION_TYPES.SET_SELECTED_TICKERS:
        if (state.selectedTickers.includes(action.payload)) {
          draft.selectedTickers = state.selectedTickers.filter(it => it !== action.payload);
        } else {
          draft.selectedTickers.push(action.payload);
        }
        break;
      default:
        break;
    }
  });
};

export type RootState = ReturnType<typeof reducer>;

export default reducer;
