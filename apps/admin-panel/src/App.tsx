import { Router } from "./Router";
import { QueryClientProvider } from "react-query";
import { queryClient } from "./utils";
import { ThemeProvider } from "./providers/ThemeProvider";
import { Toaster } from "./components/ui";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="medory-theme">
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Router />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
