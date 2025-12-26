import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowDropDown, Language } from "@mui/icons-material";
import { TIMEZONES } from "../../constants/timezones";

type CalendarProps = {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availableDays?: number[]; // Array of day_of_week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  timezone?: string;
  onTimezoneChange?: (timezone: string) => void;
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Calendar = ({ selectedDate, onSelectDate, availableDays, timezone = "Asia/Kathmandu", onTimezoneChange }: CalendarProps) => {
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

  const isAvailableDay = (date: Date) => {
    // If availableDays prop is provided, use it; otherwise allow all days
    if (availableDays && availableDays.length > 0) {
      return availableDays.includes(date.getDay());
    }
    // Default: allow all days if no availability data is provided
    return true;
  };

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
              className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition
                ${
                  isSelected
                    ? "bg-blue-600 text-white font-semibold"
                    : isToday && isAvailable
                    ? "border border-blue-600 text-blue-600 font-medium"
                    : disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:font-semibold cursor-pointer"
                }
              `}
            >
              {i + 1}

              {isToday && !isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-gray-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 space-y-3">
        <div className="relative">
          <Language className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600 pr-1" />

          <select
            value={timezone}
            onChange={(e) => onTimezoneChange?.(e.target.value)}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white
                      cursor-pointer py-2 pl-9 pr-10 text-xs text-gray-700
                      hover:border-gray-400
                      focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>

          <ArrowDropDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
