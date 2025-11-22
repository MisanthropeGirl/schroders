import { Action, ThunkAction, combineReducers, configureStore } from '@reduxjs/toolkit';
import chartOptionsReducer from './components/ChartOptions/chartOptionsSlice';
import stockListReducer from './components/StockList/stockListSlice';
import stockChartReducer from './components/StockChart/stockChartSlice';

export const rootReducer = combineReducers({
  options: chartOptionsReducer,
  stocks: stockListReducer,
  chart: stockChartReducer
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
