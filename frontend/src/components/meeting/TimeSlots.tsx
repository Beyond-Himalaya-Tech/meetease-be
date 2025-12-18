import { useState } from "react";

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
};

const TimeSlots = ({ selectedDate, onSelectTime }: Props) => {
  if (!selectedDate) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        Select an available date
      </div>
    );
  }

  const day = selectedDate.getDay();
  const slots = SLOTS_BY_DAY[day];

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
            className="w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-blue-600 transition hover:border-blue-600 hover:bg-blue-50"
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlots;
