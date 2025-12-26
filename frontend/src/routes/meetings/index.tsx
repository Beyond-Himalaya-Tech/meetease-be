import { createFileRoute } from "@tanstack/react-router";
import NewMeetingPage from "../../components/meeting/NewMeeting";

export const Route = createFileRoute("/meetings/")({
  component: MeetingRoute,
});

function MeetingRoute() {
  return (
    <section>
      <NewMeetingPage />
    </section>
  );
}


