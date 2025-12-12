import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import type { FormEvent } from "react";

export const Route = createFileRoute("/(auth)/")({
  component: LoginRoute,
});

function LoginRoute() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    console.log("Login submitted:", { email, password });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <section
        aria-labelledby="login-heading"
        className="w-full max-w-md bg-white shadow-md rounded-lg p-6 sm:p-8"
      >
        <header className="mb-4 sm:mb-6">
          <h1
            id="login-heading"
            className="text-xl sm:text-2xl font-semibold text-center"
          >
            Login
          </h1>
        </header>

        <form
          className="space-y-4"
          aria-describedby="login-description"
          noValidate
          onSubmit={handleSubmit}
        >
          <p id="login-description" className="text-sm text-gray-600">
            Enter your email and password to access your account.
          </p>

          <fieldset className="space-y-4">
            <legend className="sr-only">Login details</legend>

            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </label>

            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password"
            >
              Password
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </label>
          </fieldset>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
          >
            Sign in
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          <Link
            to="/forget-password"
            className="text-blue-600 hover:text-blue-700 font-medium underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
          >
            Forgot your password?
          </Link>
        </p>
      </section>
    </main>
  );
}

