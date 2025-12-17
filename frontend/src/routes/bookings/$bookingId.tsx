import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/bookings/$bookingId")({
  component: BookingDetailRoute,
});

function BookingDetailRoute() {
  const { bookingId } = Route.useParams();

  // In a real app, fetch booking detail by ID here
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6">
      <section className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          Booking {bookingId}
        </h1>
        <p className="text-sm text-gray-600">
          This page is ready to show full booking details for ID{" "}
          <span className="font-mono">{bookingId}</span>. You can hook this up
          to your API later.
        </p>
      </section>
    </main>
  );
}

