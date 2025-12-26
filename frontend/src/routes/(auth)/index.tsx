import { createFileRoute } from "@tanstack/react-router";
import { API_BASE_URL } from "../../lib/api";

export const Route = createFileRoute("/(auth)/")({
  component: LoginRoute,
});

function LoginRoute() {
  const handleGoogleSignIn = async () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch(`${API_BASE_URL}/auth/authorize?timezone=${encodeURIComponent(timezone)}`);
      if (!res.ok) {
        throw new Error("Failed to get auth URL");
      }
      const data: { authUrl: string } = await res.json();
      if (!data.authUrl) {
        throw new Error("authUrl missing from response");
      }
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Google sign-in failed", error);
      alert("Unable to start Google sign-in. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <section
        aria-labelledby="login-heading"
        className="w-full max-w-md bg-white rounded-lg p-6 sm:p-8"
      >
        <header className="mb-6 sm:mb-8">
          <h1
            id="login-heading"
            className="text-xl sm:text-2xl font-semibold text-center"
          >
            Login
          </h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Sign in with your Google account to continue.
          </p>
        </header>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full border border-gray-300 rounded-md py-2.5 flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5"
          />
          Sign in with Google
        </button>
      </section>
    </main>
  );
}

