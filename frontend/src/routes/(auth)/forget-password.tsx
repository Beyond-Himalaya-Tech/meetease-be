import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/forget-password")({
  component: ForgetPasswordRoute,
});

function ForgetPasswordRoute() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <section
        aria-labelledby="forgot-password-heading"
        className="w-full max-w-md bg-white shadow-md rounded-lg p-6 sm:p-8"
      >
        <header className="mb-4 sm:mb-6">
          <h1
            id="forgot-password-heading"
            className="text-xl sm:text-2xl font-semibold text-center"
          >
            Forgot password
          </h1>
        </header>

        <form
          className="space-y-4"
          aria-describedby="forgot-password-description"
          noValidate
        >
          <p
            id="forgot-password-description"
            className="text-sm text-gray-600"
          >
            Enter the email associated with your account and we&apos;ll send you
            instructions to reset your password.
          </p>

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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
          >
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}