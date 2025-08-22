import { ConfigProvider, Empty, App as AntApp } from "antd";
import { Router } from "./Router";
import { QueryClientProvider } from "react-query";
import { queryClient, theme, table, modal } from "./utils";

function App() {
  return (
    <ConfigProvider
      theme={theme}
      table={table}
      modal={modal}
      componentSize="large"
      renderEmpty={() => <Empty description="No data" />}
    >
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <Router />
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
