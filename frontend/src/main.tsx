import { RouterProvider } from "@tanstack/react-router";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "./index.css";
import { router } from "./router";
import { bootstrapAuth } from "./auth/storage";

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes - cache garbage collection time
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Retry failed requests once
    },
  },
});

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb", // Tailwind blue-600
    },
    background: {
      default: "#f3f4f6", // Tailwind gray-100
      paper: "#ffffff", // White for cards, sidebar, and header
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 700,
      fontSize: "2.25rem",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "1.875rem",
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    body1: {
      fontSize: "0.95rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
});

export function App() {
  useEffect(() => {
    void bootstrapAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: "#fff",
              color: "#1f2937",
              borderRadius: "0.75rem",
              border: "1px solid #e5e7eb",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
