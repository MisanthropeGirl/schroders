import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux';
import { store } from './store';

const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}

interface CustomRenderResult extends ReturnType<typeof render> {
  store: typeof store;
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): CustomRenderResult => {
  return {
    ...render(ui, { wrapper: ReduxProvider, ...options }),
    store
  }
};

export * from '@testing-library/react'
export { customRender as render }
