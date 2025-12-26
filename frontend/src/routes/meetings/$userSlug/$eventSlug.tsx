import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import NewMeetingPage from "../../../components/meeting/NewMeeting";
import type { EventInfoProps } from "../../../components/meeting/EventInfo";
import { Box, Typography, CircularProgress } from "@mui/material";
import { getEventTypeById, getAvailabilitiesByUserId } from "../../../lib/api";

export const Route = createFileRoute("/meetings/$userSlug/$eventSlug")({
  component: MeetingPageRoute,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: search.id ? Number(search.id) : undefined,
    };
  },
});

function MeetingPageRoute() {
  const { userSlug, eventSlug } = Route.useParams();
  const { id: eventId } = Route.useSearch();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState<EventInfoProps | null>(null);
  const [eventTypeId, setEventTypeId] = useState<number | null>(eventId ?? null);
  const [availableDays, setAvailableDays] = useState<number[]>([]);

  useEffect(() => {
    const loadEventData = async () => {
      try {
        // If we have event ID from query param, use it directly
        if (eventId) {
          const eventType = await getEventTypeById(eventId);
          // Fetch user info to get organizer name
          // For now, use slug as organizer name (format: "beyond.himalayan" -> "Beyond Himalayan")
          const organizerName = userSlug.replace(/\./g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          
          setEventData({
            organizer: organizerName,
            title: eventType.title,
            duration: eventType.duration_minutes,
            location: "Google Meet", // Default location
            description: eventType.description || "Please select a date and time for the meeting.",
          });
          setEventTypeId(eventType.id);

          // Fetch availabilities for the event type's user
          try {
            if (eventType.user_id) {
              const availabilities = await getAvailabilitiesByUserId(eventType.user_id);
              // Extract day_of_week values (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
              const days = availabilities.map((avail) => avail.day_of_week);
              setAvailableDays(days);
            }
          } catch (availErr) {
            // If we can't fetch availabilities (e.g., public page without auth), 
            // just continue without available days - Calendar will allow all days
            console.warn("Could not fetch availabilities:", availErr);
          }

          setLoading(false);
        } else {
          setError("Event ID is required. Please use a valid booking link.");
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
        setLoading(false);
      }
    };

    void loadEventData();
  }, [userSlug, eventSlug, eventId]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !eventData) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          px: 2,
        }}
      >
        <Typography color="error" variant="h6">
          {error || "Event not found"}
        </Typography>
      </Box>
    );
  }

  return (
    <section>
      <NewMeetingPage 
        eventData={eventData} 
        eventTypeId={eventTypeId}
        availableDays={availableDays}
      />
    </section>
  );
}

