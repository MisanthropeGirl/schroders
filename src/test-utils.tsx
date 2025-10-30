import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { store } from './store';
import reducer from './reducers';

const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}

interface CustomRenderResult extends ReturnType<typeof render> {
  store: typeof store;
  preloadedState: typeof store;
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

  const testStore = preloadedState 
    ? createStore(reducer, mergedState) 
    : store;
  
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
