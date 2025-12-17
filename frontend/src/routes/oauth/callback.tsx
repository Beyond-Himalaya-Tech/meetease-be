import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { setToken } from "../../auth/storage";

export const Route = createFileRoute("/oauth/callback")({
  component: OAuthCallbackRoute,
});

function OAuthCallbackRoute() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (!token) {
      window.location.replace("/");
      return;
    }

    setToken(token);
    window.location.replace("/dashboard/");
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-sm text-gray-700">Signing you in…</p>
    </main>
  );
}