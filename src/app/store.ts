import { Action, ThunkAction, combineReducers, configureStore } from '@reduxjs/toolkit';
import dateSelectorReducer from '../components/DateSelector/dateSelectorSlice';
import priceOptionsReducer from '../components/PriceOptions/priceOptionsSlice';
import stockChartReducer from '../components/StockChart/stockChartSlice';
import stockListReducer from '../components/StockList/stockListSlice';

export const rootReducer = combineReducers({
  chart: stockChartReducer,
  dates: dateSelectorReducer,
  price: priceOptionsReducer,
  stocks: stockListReducer,
})

export const store = configureStore({
  reducer: rootReducer
});

// Infer the type of `store`
export type AppStore = typeof store;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch;
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>;
// Export a reusable type for handwritten thunks
export type AppThunk = ThunkAction<void, RootState, unknown, Action>
