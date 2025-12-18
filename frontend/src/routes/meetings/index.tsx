import { createFileRoute } from "@tanstack/react-router";
import DefaultLayout from "../../layouts/DefaultLayout";
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


