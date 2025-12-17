import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AvailabilityHeader from "../../components/availability/AvailabilityHeader";
import CalendarSettings from "../../components/availability/CalendarSettings";
import EventTypesModal from "../../components/availability/EventTypesModal";
import type { EventType, WeeklyRow } from "../../components/availability/types";
import WeeklyHoursCard from "../../components/availability/WeeklyHoursCard";
import DefaultLayout from "../../layouts/DefaultLayout";

export const Route = createFileRoute("/availability/")({
  component: AvailabilityRoute,
});

function AvailabilityRoute() {
  const [activeTab, setActiveTab] = useState<"schedules" | "calendar">(
    "schedules",
  );
  const [isEventTypeModalOpen, setIsEventTypeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [weeklyRows, setWeeklyRows] = useState<WeeklyRow[]>([
    { short: "S", label: "Sunday", unavailable: true },
    { short: "M", label: "Monday", from: "14:15", to: "18:00" },
    { short: "T", label: "Tuesday", from: "14:15", to: "18:00" },
    { short: "W", label: "Wednesday", from: "14:15", to: "18:00" },
    { short: "T", label: "Thursday", from: "14:15", to: "18:00" },
    { short: "F", label: "Friday", unavailable: true },
    { short: "S", label: "Saturday", unavailable: true },
  ]);

  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  );

  const [eventTypes, setEventTypes] = useState<EventType[]>([
    {
      id: "interview-beyond",
      name: "Interview with Beyond",
      duration: "30 mins",
      location: "Google Meet",
      selected: true,
    },
  ]);

  return (
    <DefaultLayout>
      <section className="max-w-6xl mx-auto w-full py-4 sm:py-6 px-4 sm:px-0">
        <AvailabilityHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "schedules" ? (
          <>
            <WeeklyHoursCard
              rows={weeklyRows}
              onChange={setWeeklyRows}
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />

            <EventTypesModal
              isOpen={isEventTypeModalOpen}
              onClose={() => setIsEventTypeModalOpen(false)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              eventTypes={eventTypes}
              onSetEventTypes={(updater) =>
                setEventTypes((prev) => updater(prev))
              }
            />
          </>
        ) : (
          <CalendarSettings />
        )}
      </section>
    </DefaultLayout>
  );
}


