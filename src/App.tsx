import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { store } from "./app/store";
import ChartOptions from "./components/ChartOptions/ChartOptions";
import StockChart from "./components/StockChart/StockChart";
import StockList from "./components/StockList/StockList";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StockChart />
        <ChartOptions />
        <StockList />
        <ReactQueryDevtools initialIsOpen />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
