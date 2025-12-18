import { useState } from "react";
import EventInfo from "./EventInfo";
import Calendar from "./Calendar";
import TimeSlots from "./TimeSlots";
import BookingForm from "../bookings/BookingForm";

const EVENT_INFO = {
  organizer: "Lakpa Lama",
  title: "Interview",
  duration: 30,
  location: "Google Meet",
  description: "Please select a date and time for the meeting."
};

const NewMeetingPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <div className="h-screen w-screen bg-gray-50 flex items-center justify-center overflow-hidden">
        {selectedDate && selectedTime ? (
          // BookingForm occupies the whole card
          <div className="w-[65%] h-[65%] overflow-hidden rounded-2xl shadow-md">
            <BookingForm
              event={EVENT_INFO}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onBack={() => setSelectedTime(null)}
            />
          </div>
        ) : (
          // Original 3-column layout
          <div className="w-[65%] h-[65%] overflow-hidden rounded-2xl shadow-md">
            <div className="grid h-full w-full grid-cols-1 md:grid-cols-3 bg-white overflow-hidden rounded-2xl">
              {/* Left: Event Info */}
              <EventInfo event={EVENT_INFO}/>

              {/* Middle: Calendar */}
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />

              {/* Right: TimeSlots */}
              <TimeSlots
                selectedDate={selectedDate}
                onSelectTime={(time: string) => setSelectedTime(time)}
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default NewMeetingPage;
