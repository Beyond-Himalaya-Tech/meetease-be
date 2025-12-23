import { useState } from "react";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import NewEventTypeForm from "./NewEventTypeForm";
import EditEventTypeDialog from "./EditEventTypeDialog";
import { useEventTypes, useUser } from "../../lib/queries";
import type { EventType } from "../../lib/api";
import toast from "react-hot-toast";

const EventTypesList = () => {
  const { data: eventTypes = [], isLoading: loading, error: queryError } = useEventTypes();
  const { data: currentUser } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [copiedEventId, setCopiedEventId] = useState<number | null>(null);

  const error = queryError instanceof Error ? queryError.message : null;

  const handleBack = () => {
    setShowForm(false);
  };

  // Helper function to create URL-friendly slug from text
  const createSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  };

  const handleCopyLink = async (event: React.MouseEvent, eventType: EventType) => {
    event.stopPropagation(); // Prevent opening edit dialog when clicking copy button
    
    // Generate dynamic booking link that redirects to /meetings/
    // Format: /meetings/{user-slug}/{event-slug}
    let bookingLink: string;
    
    if (currentUser) {
      // Create user slug from email (extract part before @) or use user ID
      const userSlug = currentUser.email.split("@")[0] || `user-${currentUser.id}`;
      // Create event slug from title or use event ID
      const eventSlug = eventType.title ? createSlug(eventType.title) : `event-${eventType.id}`;
      
      // Link format: /meetings/{user-slug}/{event-slug}?id={eventId}
      bookingLink = `${window.location.origin}/meetings/${userSlug}/${eventSlug}?id=${eventType.id}`;
    } else {
      // Fallback: use event ID only if user not available
      bookingLink = `${window.location.origin}/meetings/event/${eventType.id}?id=${eventType.id}`;
    }
    
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(bookingLink);
        // Show "Copied!" feedback
        setCopiedEventId(eventType.id);
        setTimeout(() => {
          setCopiedEventId(null);
        }, 2000); // Reset after 2 seconds
        toast.success("Booking link copied to clipboard!");
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = bookingLink;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        // Show "Copied!" feedback
        setCopiedEventId(eventType.id);
        setTimeout(() => {
          setCopiedEventId(null);
        }, 2000); // Reset after 2 seconds
        toast.success("Booking link copied to clipboard!");
      }
    } catch {
      toast.error("Failed to copy link. Please try again.");
    }
  };

  return (
    <>
      {!showForm ? (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
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
              {eventTypes.map((event: EventType) => (
                <li
                  key={event.id}
                  onClick={() => {
                    setEditingEventType(event);
                    setIsEditDialogOpen(true);
                  }}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {event.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {event.duration_minutes} mins
                      {event.client_tag ? ` · ${event.client_tag}` : null}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleCopyLink(e, event)}
                      title={copiedEventId === event.id ? "Copied!" : "Copy booking link"}
                      className={`p-1.5 rounded-md transition-all ${
                        copiedEventId === event.id
                          ? "text-green-600 bg-green-50"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {copiedEventId === event.id ? (
                        <div className="flex items-center gap-1">
                          <CheckIcon className="h-4 w-4" />
                          <span className="text-xs font-medium">Copied!</span>
                        </div>
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      )}
                    </button>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        event.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {event.is_active ? "Active" : "Paused"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <NewEventTypeForm
          onBack={handleBack}
          onCreated={() => {
            setShowForm(false);
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
        onUpdated={() => {
          setIsEditDialogOpen(false);
          setEditingEventType(null);
        }}
      />
    </>
  );
};

export default EventTypesList;
