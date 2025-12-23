import { createFileRoute } from "@tanstack/react-router";
import BookingConfirmation from "../../components/bookings/BookingConfirmation";

export const Route = createFileRoute("/bookings/confirmation")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      title: (search.title as string) || "",
      organizer: (search.organizer as string) || "",
      date: search.date ? new Date(search.date as string) : new Date(),
      timeRange: (search.timeRange as string) || "",
      timezone: (search.timezone as string) || "Asia/Kathmandu",
    };
  },
  component: BookingConfirmationRoute,
});

function BookingConfirmationRoute() {
  const { title, organizer, date, timeRange, timezone } = Route.useSearch();

  return (
    <BookingConfirmation
      eventTitle={title}
      organizerName={organizer}
      date={date}
      timeRange={timeRange}
      timezone={timezone}
    />
  );
}

