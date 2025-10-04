import { AnyAction } from 'redux';
import { ACTION_TYPES, DATE_MAX, DATE_MIN } from "../constants";
import { chartPriceOptions } from '../components/ChartOptions/ChartOptions';

const initialState: Store = {
  priceOption: chartPriceOptions[0],
  fromDate: DATE_MIN,
  toDate: DATE_MAX,
  selectedTickers: []
};

const reducer = (state: Store = initialState, action: AnyAction): Store => {
	switch (action.type) {
		case ACTION_TYPES.SET_FROM_DATE:
			return {
				...state,
				fromDate: action.payload,
			};
    case ACTION_TYPES.SET_TO_DATE:
      return {
        ...state,
        toDate: action.payload,
      };
    case ACTION_TYPES.SET_CHART_PRICING_OPTION:
      return {
        ...state,
        priceOption: action.payload,
      };
    case ACTION_TYPES.SET_NEW_TICKER: 
      return {
        ...state,
        newTicker: action.payload,
      }
    case ACTION_TYPES.SET_REMOVED_TICKER: 
      return {
        ...state,
        removedTicker: action.payload,
      }
    case ACTION_TYPES.SET_SELECTED_TICKERS:
      return {
        ...state,
        selectedTickers: state.selectedTickers.includes(action.payload)
          ? state.selectedTickers.filter(it => it !== action.payload)
          : [...state.selectedTickers, action.payload]
      }
    default:
			return { ...state };
	}
};

export type RootState = ReturnType<typeof reducer>;

export default reducer;
