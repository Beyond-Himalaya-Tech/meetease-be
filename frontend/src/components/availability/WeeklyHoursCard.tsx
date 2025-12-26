import { ClipboardDocumentIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { WeeklyRow } from "./types";
import { tzMap } from "../../constants/timezones";

type WeeklyHoursCardProps = {
  rows: WeeklyRow[];
  onChange: (rows: WeeklyRow[]) => void;
  timezone: string;
  onTimezoneChange: (value: string) => void;
};

const WeeklyHoursCard = ({
  rows,
  onChange,
  timezone,
  onTimezoneChange,
}: WeeklyHoursCardProps) => {
  const updateRow = (index: number, patch: Partial<WeeklyRow>) => {
    const next = rows.map((row, i) =>
      i === index ? { ...row, ...patch } : row,
    );
    onChange(next);
  };

  const handleTimeChange = (
    index: number,
    field: "from" | "to",
    value: string,
  ) => {
    updateRow(index, {
      [field]: value,
      unavailable: false,
    });
  };

  const handleRemoveHours = (index: number) => {
    updateRow(index, {
      from: undefined,
      to: undefined,
      unavailable: true,
    });
  };

  const handleSetDefaultHours = (index: number) => {
    updateRow(index, {
      from: "14:15",
      to: "18:00",
      unavailable: false,
    });
  };

  const handleCopyFromPrevious = (index: number) => {
    if (index === 0) return;
    const prev = rows[index - 1];
    if (!prev) return;
    updateRow(index, {
      from: prev.from,
      to: prev.to,
      unavailable: prev.unavailable,
    });
  };

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white">
      {/* Card header */}
      <div className="flex flex-col gap-2 border-b border-gray-200 px-4 sm:px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Weekly hours</h2>
          <p className="text-xs text-gray-500">
            Set when you are typically available for meetings
          </p>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-8 px-4 sm:px-6 py-4 sm:py-6 lg:flex-row">
        {/* Weekly hours column */}
        <section
          aria-label="Weekly hours"
          className="flex-1 min-w-[260px] space-y-4"
        >
          <ul className="space-y-3">
            {rows.map((row, index) => (
              <li
                key={row.label}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 text-sm text-gray-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                  {row.short}
                </div>
                <div className="flex-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  {row.unavailable ? (
                    <span className="text-gray-500">Unavailable</span>
                  ) : (
                    <div className="inline-flex items-center gap-2">
                      <input
                        type="time"
                        value={row.from ?? ""}
                        onChange={(e) =>
                          handleTimeChange(index, "from", e.target.value)
                        }
                        className="w-24 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`${row.label} start time`}
                      />
                      <span className="mx-1 text-gray-400">–</span>
                      <input
                        type="time"
                        value={row.to ?? ""}
                        onChange={(e) =>
                          handleTimeChange(index, "to", e.target.value)
                        }
                        className="w-24 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`${row.label} end time`}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-400 justify-start sm:justify-end">
                    <button
                      type="button"
                      className="hover:text-gray-600"
                      aria-label="Remove hours"
                      onClick={() => handleRemoveHours(index)}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="hover:text-gray-600"
                      aria-label="Set default hours"
                      onClick={() => handleSetDefaultHours(index)}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="hover:text-gray-600"
                      aria-label="Copy hours from previous day"
                      onClick={() => handleCopyFromPrevious(index)}
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Footer timezone */}
      <div className="border-t border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="text-xs text-gray-500">Time zone</span>
        <select
          value={timezone}
          onChange={(e) => onTimezoneChange(e.target.value)}
          className="max-w-xs rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.keys(tzMap).map((tz) => (
            <option key={tz} value={tz}>
              {tzMap[tz]} Time
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default WeeklyHoursCard;


