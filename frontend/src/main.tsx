import { RouterProvider } from "@tanstack/react-router";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { router } from "./router";
import { bootstrapAuth } from "./auth/storage";

export function App() {
  useEffect(() => {
    void bootstrapAuth();
  }, []);

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
