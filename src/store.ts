import { configureStore } from '@reduxjs/toolkit';
import chartOptionsReducer from './components/ChartOptions/chartOptionsSlice';
import stockListReducer from './components/StockList/stockListSlice';

export const store = configureStore({
  reducer: {
    options: chartOptionsReducer,
    stocks: stockListReducer
  }
});

// Infer the type of `store`
export type AppStore = typeof store;
// Infer the `AppDispatch` type from the store itself
// export type AppDispatch = typeof store.dispatch;
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>;
