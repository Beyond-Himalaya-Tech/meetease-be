import React from "react";

type NewEventTypeFormProps = {
  onBack: () => void;
};

const NewEventTypeForm = ({ onBack }: NewEventTypeFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload
    console.log("Form submitted");
    // Add your form submission logic here
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm"
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
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            defaultChecked
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
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Create event type
        </button>
      </div>
    </form>
  );
};

export default NewEventTypeForm;
