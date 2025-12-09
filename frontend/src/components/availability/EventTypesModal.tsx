import type { EventType } from "./types";

type EventTypesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  eventTypes: EventType[];
  onSetEventTypes: (updater: (prev: EventType[]) => EventType[]) => void;
};

const EventTypesModal = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  eventTypes,
  onSetEventTypes,
}: EventTypesModalProps) => {
  if (!isOpen) return null;

  const filtered = eventTypes.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase().trim()),
  );

  const updateAll = (selected: boolean) =>
    onSetEventTypes((prev) => prev.map((et) => ({ ...et, selected })));

  const toggleOne = (id: number, selected: boolean) =>
    onSetEventTypes((prev) =>
      prev.map((et) => (et.id === id ? { ...et, selected } : et)),
    );

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="max-w-md w-full rounded-xl bg-white shadow-xl border border-gray-200">
        <div className="px-6 pt-6 pb-4 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-blue-500/70 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-600">
            <button
              type="button"
              className="hover:underline font-medium"
              onClick={() => updateAll(true)}
            >
              select all
            </button>
            <span className="text-gray-300">/</span>
            <button
              type="button"
              className="hover:underline"
              onClick={() => updateAll(false)}
            >
              clear
            </button>
          </div>

          <div className="pt-2 space-y-2">
            <p className="text-xs font-semibold tracking-wide text-gray-700">
              USING WORKING HOURS
            </p>
            {filtered.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-lg px-1 py-2"
              >
                <input
                  id={event.id}
                  type="checkbox"
                  checked={event.selected}
                  onChange={(e) => toggleOne(event.id, e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-blue-500 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <label
                    htmlFor={event.id}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-900"
                  >
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-purple-500" />
                    {event.name}
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    {event.duration} • {event.location}
                  </p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-gray-400">
                No event types match your search.
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={onClose}
          >
            Apply
          </button>
          <button
            type="button"
            className="text-sm font-medium text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventTypesModal;


