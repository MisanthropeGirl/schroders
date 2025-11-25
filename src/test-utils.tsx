import React, { ReactElement } from 'react'
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react'
import { rootReducer, RootState } from './app/store';

interface CustomRenderResult extends ReturnType<typeof render> {
  store: ReturnType<typeof configureStore>;
}

const customRender = (
  ui: ReactElement,
  {
    preloadedState,
    ...options
  }: Omit<RenderOptions, 'wrapper'> & { preloadedState?: Partial<RootState> } = {}
) => {
  // Get the initial state from your reducer
  const initialState = rootReducer(undefined, { type: '@@INIT' });

  // Merge preloaded state with initial state
  const mergedState = preloadedState
    ? { ...initialState, ...preloadedState }
    : initialState;

  const testStore = configureStore({
    reducer: rootReducer,
    preloadedState: mergedState
  });

  const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
    return <Provider store={testStore}>{children}</Provider>
  }

  return {
    ...render(ui, { wrapper: ReduxProvider, ...options }),
    store: testStore
  }
}

export * from '@testing-library/react'
export { customRender as render }
