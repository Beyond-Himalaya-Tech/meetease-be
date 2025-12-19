import { useState } from "react";
import { ClockFading, Video } from "lucide-react";
import type { EventInfoProps } from "../meeting/EventInfo";

type Props = {
  event: EventInfoProps;
  selectedDate: Date;
  selectedTime: string;
  onBack: () => void;
};

const BookingForm = ({ event, selectedDate, selectedTime, onBack }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const getEndTime = () => {
    const [hourMin, meridiem] = selectedTime.split(" ");
    let [hours, minutes] = hourMin.split(":").map(Number);
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    const start = new Date(selectedDate);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start.getTime() + event.duration * 60 * 1000);
    return end;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, email, notes });
    alert("Event scheduled! (Demo only)");
  };

  const endTime = getEndTime();

  return (
    <div className="grid h-full w-full grid-cols-1 md:grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-md">
      
      {/* Left: Event Details */}
      <div className="border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{event.organizer}</p>
          <h1 className="mt-2 text-xl font-semibold text-gray-900">
            {event.title}
          </h1>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <ClockFading size={16} />
              <span>{event.duration} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Video size={16} />
              <span>{event.description}</span>
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            {selectedTime} -{" "}
            {endTime.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" })},{" "}
            {selectedDate.toLocaleDateString("default", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-sm text-gray-500">Nepal Time</p>
        </div>

        <button
          onClick={onBack}
          className="mt-6 text-sm text-blue-600 hover:underline"
        >
          ← Back to Timeslots selection
        </button>
      </div>

      {/* Right: Booking Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 flex flex-col justify-between overflow-y-auto"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
                Name
                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                    *
                </span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
                Email
                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                    *
                </span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Please share anything that will help prepare for our meeting
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
              rows={4}
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 transition"
        >
          Schedule Event
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
