import React, { useState } from "react";
import { useCreateEventType } from "../../lib/queries";

type NewEventTypeFormProps = {
  onBack: () => void;
  onCreated?: () => Promise<void> | void;
};

const NewEventTypeForm = ({ onBack, onCreated }: NewEventTypeFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<number | "">("");
  const [clientTag, setClientTag] = useState("");
  const [isActive, setIsActive] = useState(true);
  const createEventTypeMutation = useCreateEventType();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !duration) return;

    createEventTypeMutation.mutate(
      {
        title,
        description: description || undefined,
        duration_minutes: typeof duration === "number" ? duration : Number(duration),
        client_tag: clientTag || undefined,
        is_active: isActive,
      },
      {
        onSuccess: () => {
          if (onCreated) {
            onCreated();
          }
          onBack();
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white"
    >
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          className="mt-0.5 text-xl font-medium text-gray-600 hover:text-gray-900"
        >
          ←
        </button>

        <div>
          <h2 className="text-base font-semibold text-gray-900">New event type</h2>
          <p className="text-xs text-gray-500">
            Define how clients can book this event
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-5 px-5 py-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Intro call"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            placeholder="Short description shown to clients"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-medium text-gray-700">
            Duration (minutes) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            placeholder="15"
            value={duration}
            onChange={(e) => setDuration(e.target.value === "" ? "" : Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Client Tag */}
        <div>
          <label className="block text-xs font-medium text-gray-700">Client tag</label>
          <input
            type="text"
            placeholder="e.g. sales, support"
            value={clientTag}
            onChange={(e) => setClientTag(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">Active</label>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createEventTypeMutation.isPending}
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createEventTypeMutation.isPending ? "Creating..." : "Create event type"}
        </button>
      </div>
    </form>
  );
};

export default NewEventTypeForm;
