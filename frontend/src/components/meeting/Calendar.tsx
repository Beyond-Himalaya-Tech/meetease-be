import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Globe } from "lucide-react";

type CalendarProps = {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const AVAILABLE_WEEK_DAYS = [1, 2, 3, 4]; // Mon–Thu

const TIMEZONES = [
  { value: "Asia/Kathmandu", label: "Nepal Time (GMT+05:45)" },
  { value: "Australia/Sydney", label: "Sydney, Melbourne, Canberra (GMT+10 / GMT+11)" },
  { value: "Australia/Brisbane", label: "Brisbane (GMT+10)" },
  { value: "Australia/Adelaide", label: "Adelaide (GMT+09:30 / GMT+10:30)" },
  { value: "Australia/Darwin", label: "Darwin (GMT+09:30)" },
  { value: "Australia/Perth", label: "Perth (GMT+08:00)" },
  { value: "Australia/Hobart", label: "Hobart (GMT+10 / GMT+11)" },
  { value: "Australia/Lord_Howe", label: "Lord Howe Island (GMT+10:30 / GMT+11)" },
  { value: "Antarctica/Macquarie", label: "Macquarie Island (GMT+10 / GMT+11)" },
];

const Calendar = ({ selectedDate, onSelectDate }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isAvailableDay = (date: Date) =>
    AVAILABLE_WEEK_DAYS.includes(date.getDay());

  return (
    <div className="h-full border-r border-gray-200 p-6 flex flex-col">
      
      {/* Month Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
        >
          <ChevronLeft size={16} />
        </button>

        <h2 className="text-sm font-semibold text-gray-900">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <button
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Week Days */}
      <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-gray-500">
        {WEEK_DAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: totalDays }, (_, i) => {
          const date = new Date(year, month, i + 1);
          const isPast = date < todayStart;
          const isAvailable = isAvailableDay(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);

          const disabled = isPast || !isAvailable;

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelectDate(date)}
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition
                ${
                  isSelected
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : isToday && isAvailable
                    ? "border border-blue-600 text-blue-600 font-medium"
                    : disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:font-semibold"
                }
              `}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-2 space-y-3">
        <p className="text-xs text-gray-500">
          Available on <span className="font-medium">Mon – Thu</span>
        </p>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />

          <select
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white
                      py-2 pl-9 pr-10 text-xs text-gray-900 shadow-sm
                      hover:border-gray-400
                      focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
