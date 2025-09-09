import { ConfigProvider, Empty, App as AntApp } from "antd";
import { Router } from "./Router";
import { QueryClientProvider } from "react-query";
import { queryClient, theme, table, modal } from "./utils";
import { ThemeProvider } from "./providers/ThemeProvider";
import { Toaster } from "./components/ui";

function App() {
  return (
    <ConfigProvider
      theme={theme}
      table={table}
      modal={modal}
      componentSize="large"
      renderEmpty={() => <Empty description="No data" />}
    >
      <ThemeProvider defaultTheme="system" storageKey="medory-theme">
        <AntApp>
          <QueryClientProvider client={queryClient}>
            <Toaster />
            <Router />
          </QueryClientProvider>
        </AntApp>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;
