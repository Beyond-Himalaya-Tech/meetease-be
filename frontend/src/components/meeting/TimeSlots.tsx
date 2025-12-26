import { useEffect, useState } from "react";
import { getEventAvailabilities } from "../../lib/api";

const SLOTS_BY_DAY: Record<number, string[]> = {
  1: [ // Monday
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "11:00 AM",
  ],
  2: [ // Tuesday
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "04:30 PM",
  ],
  3: [ // Wednesday
    "01:00 PM",
    "02:00 PM",
    "03:30 PM",
  ],
};

type Props = {
  selectedDate: Date | null;
  onSelectTime: (time: string) => void; // callback to parent
  eventTypeId?: number | null;
  timezone?: string | null;
};

const TimeSlots = ({ selectedDate, onSelectTime, eventTypeId, timezone }: Props) => {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAvailabilities = async () => {
      if (!selectedDate || !eventTypeId || !timezone) {
        // Fallback to static slots if no eventTypeId
        if (selectedDate) {
          const day = selectedDate.getDay();
          setSlots(SLOTS_BY_DAY[day] || []);
        } else {
          setSlots([]);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Format date as YYYY-MM-DD using local date components (not UTC)
        // This prevents timezone conversion from shifting the date
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const availableSlots = await getEventAvailabilities(eventTypeId, dateStr, timezone);
        
        // Ensure availableSlots is an array
        if (!Array.isArray(availableSlots)) {
          setSlots([]);
          return;
        }
        
        // Convert time slots to readable format (assuming API returns time strings)
        // The API returns time in format like "09:00" or similar
        const formattedSlots = availableSlots.map((slot: string) => {
          // Convert 24-hour format to 12-hour format with AM/PM
          if (typeof slot === "string" && slot.includes(":")) {
            const [hours, minutes] = slot.split(":").map(Number);
            const period = hours >= 12 ? "PM" : "AM";
            const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
            return `${displayHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
          }
          return slot;
        });
        
        setSlots(formattedSlots);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load availabilities");
        // Fallback to static slots on error
        if (selectedDate) {
          const day = selectedDate.getDay();
          setSlots(SLOTS_BY_DAY[day] || []);
        }
      } finally {
        setLoading(false);
      }
    };

    void loadAvailabilities();
  }, [selectedDate, eventTypeId, timezone]);

  if (!selectedDate) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        Select an available date
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        Loading available times...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        All time slots are booked for this day
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        {selectedDate.toLocaleDateString("default", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </h3>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {slots.map((time) => (
          <button
            key={time}
            onClick={() => onSelectTime(time)} // call parent callback
            className="w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-blue-600 transition hover:border-blue-600 hover:bg-blue-50 cursor-pointer"
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlots;
