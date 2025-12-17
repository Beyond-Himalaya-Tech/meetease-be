import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/customers/$customerId")({
  component: CustomerDetailRoute,
});

function CustomerDetailRoute() {
  const { customerId } = Route.useParams();

  // In a real app, fetch customer detail by ID here
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6">
      <section className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          Customer {customerId}
        </h1>
        <p className="text-sm text-gray-600">
          This page is ready to show full customer details for ID{" "}
          <span className="font-mono">{customerId}</span>.
        </p>
      </section>
    </main>
  );
}


