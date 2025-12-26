import { useState } from "react";
import EventInfo from "./EventInfo";
import Calendar from "./Calendar";
import TimeSlots from "./TimeSlots";
import BookingForm from "../bookings/BookingForm";
import type { EventInfoProps } from "./EventInfo";

const DEFAULT_EVENT_INFO: EventInfoProps = {
  organizer: "Lakpa Lama",
  title: "Interview",
  duration: 30,
  location: "Google Meet",
  description: "Please select a date and time for the meeting.",
};

type NewMeetingPageProps = {
  eventData?: EventInfoProps;
  eventTypeId?: number | null;
  availableDays?: number[];
  timezone?: string;
};

const NewMeetingPage = ({ eventData, eventTypeId, availableDays, timezone: initialTimezone = "Asia/Kathmandu" }: NewMeetingPageProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>(initialTimezone);
  
  // Use provided eventData or fallback to default
  const eventInfo = eventData || DEFAULT_EVENT_INFO;

  return (
    <div className="h-screen w-screen bg-gray-50 flex items-center justify-center overflow-hidden">
        {selectedDate && selectedTime ? (
          // BookingForm occupies the whole card
                 <div className="w-[65%] h-[65%] overflow-hidden rounded-2xl">
                   <BookingForm
                     event={eventInfo}
                     selectedDate={selectedDate}
                     selectedTime={selectedTime}
                     onBack={() => setSelectedTime(null)}
                     eventTypeId={eventTypeId ?? null}
                     timezone={timezone}
                   />
                 </div>
        ) : (
          // Original 3-column layout
          <div className="w-[65%] h-[65%] overflow-hidden rounded-2xl">
            <div className="grid h-full w-full grid-cols-1 md:grid-cols-3 bg-white overflow-hidden rounded-2xl">
              {/* Left: Event Info */}
              <EventInfo {...eventInfo} />

              {/* Middle: Calendar */}
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                availableDays={availableDays}
                timezone={timezone}
                onTimezoneChange={setTimezone}
              />

              {/* Right: TimeSlots */}
              <TimeSlots
                selectedDate={selectedDate}
                onSelectTime={(time: string) => setSelectedTime(time)}
                eventTypeId={eventTypeId}
                timezone={timezone}
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default NewMeetingPage;
