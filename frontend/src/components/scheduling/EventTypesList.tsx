import { useState } from "react";
import NewEventTypeForm from "./NewEventTypeForm";

type EventType = {
  id: number;
  name: string;
  duration: string;
  location: string;
  status: "Active" | "Paused";
};

const mockEventTypes: EventType[] = [
  {
    id: 1,
    name: "Intro call",
    duration: "15 mins",
    location: "Google Meet",
    status: "Active",
  },
  {
    id: 2,
    name: "Product demo",
    duration: "30 mins",
    location: "Zoom",
    status: "Active",
  },
  {
    id: 3,
    name: "Customer check-in",
    duration: "45 mins",
    location: "Phone",
    status: "Paused",
  },
];

const EventTypesList = () => {
  const [showForm, setShowForm] = useState(false);

  const handleBack = () => {
    setShowForm(false);
  };

  return (
    <>
      {!showForm ? (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Event types
            </h2>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
            >
              + New event type
            </button>
          </div>

          {/* List */}
          <ul className="divide-y divide-gray-100">
            {mockEventTypes.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {event.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {event.duration} · {event.location}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    event.status === "Active"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {event.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <NewEventTypeForm onBack={handleBack} />
      )}
    </>
  );
};

export default EventTypesList;
