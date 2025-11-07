import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          defaultColorScheme="light"
          theme={{
            fontFamily: "Inter, Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            headings: { fontFamily: "Poppins, Inter, sans-serif" },
            primaryColor: "blue",
            defaultRadius: "lg",
          }}
        >
          <Notifications position="top-right" />
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </MantineProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);
