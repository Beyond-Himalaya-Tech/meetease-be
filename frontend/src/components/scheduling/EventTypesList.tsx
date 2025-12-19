import { useCallback, useEffect, useState } from "react";
import NewEventTypeForm from "./NewEventTypeForm";
import EditEventTypeDialog from "./EditEventTypeDialog";
import { getEventTypes, type EventType } from "../../lib/api";

const EventTypesList = () => {
  const [showForm, setShowForm] = useState(false);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const loadEventTypes = useCallback(async () => {
    let cancelled = false;
    try {
      setLoading(true);
      setError(null);
      const data = await getEventTypes();
      if (!cancelled) {
        setEventTypes(data);
      }
    } catch (err) {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : "Failed to load event types");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadEventTypes();
  }, [loadEventTypes]);

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
          {loading ? (
            <div className="px-5 py-6 text-sm text-gray-500">Loading event types...</div>
          ) : error ? (
            <div className="px-5 py-6 text-sm text-red-500">{error}</div>
          ) : eventTypes.length === 0 ? (
            <div className="px-5 py-6 text-sm text-gray-500">
              No event types found. Click &quot;New event type&quot; to create one.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {eventTypes.map((event) => (
                <li
                  key={event.id}
                  onClick={() => {
                    setEditingEventType(event);
                    setIsEditDialogOpen(true);
                  }}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-gray-50 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {event.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {event.duration_minutes} mins
                      {event.client_tag ? ` · ${event.client_tag}` : null}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      event.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {event.is_active ? "Active" : "Paused"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <NewEventTypeForm
          onBack={handleBack}
          onCreated={async () => {
            await loadEventTypes();
          }}
        />
      )}

      <EditEventTypeDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingEventType(null);
        }}
        eventType={editingEventType}
        onUpdated={async () => {
          await loadEventTypes();
        }}
      />
    </>
  );
};

export default EventTypesList;
