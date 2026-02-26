import React, { ReactElement, ReactNode } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, RenderOptions } from "@testing-library/react";
import { rootReducer, RootState } from "./app/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry on test failures
        refetchOnWindowFocus: false,
        cacheTime: 0, // Don't cache between tests
      },
    },
  });
}

export function queryClientProviderWrapper() {
  const testQueryClient = createTestQueryClient();

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  {
    preloadedState,
    ...options
  }: Omit<RenderOptions, "wrapper"> & {
    preloadedState?: Partial<RootState>;
  } = {},
) => {
  // Get the initial state from your reducer
  const initialState = rootReducer(undefined, { type: "@@INIT" });

  const testQueryClient = createTestQueryClient();

  // Merge preloaded state with initial state
  const mergedState = preloadedState ? { ...initialState, ...preloadedState } : initialState;

  const testStore = configureStore({
    reducer: rootReducer,
    preloadedState: mergedState,
  });

  const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
    return (
      <Provider store={testStore}>
        <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  };

  return {
    ...render(ui, { wrapper: ReduxProvider, ...options }),
    store: testStore,
  };
};

export * from "@testing-library/react";
export { customRender as render };
