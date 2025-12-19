import { createFileRoute, redirect } from "@tanstack/react-router";
import { clearToken } from "../auth/storage";
import { API_BASE_URL } from "../lib/api";

export const Route = createFileRoute("/logout")({
  beforeLoad: async () => {
    clearToken();
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore errors; user will appear logged out until they sign in again.
    }

    throw redirect({ to: "/" });
  },
});


