import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducer from './reducers';

interface CustomRenderResult extends ReturnType<typeof render> {
  store: ReturnType<typeof createStore>;
}

const customRender = (
  ui: ReactElement,
  {
    preloadedState,
    ...options
  }: Omit<RenderOptions, 'wrapper'> & { preloadedState?: Partial<Store> } = {}
) => {
  // Get the initial state from your reducer
  const initialState = reducer(undefined, { type: '@@INIT' });

  // Merge preloaded state with initial state
  const mergedState = preloadedState
    ? { ...initialState, ...preloadedState }
    : initialState;

  const testStore = createStore(reducer, mergedState);

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
