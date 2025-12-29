import { useState } from "react";
import {
  AccessTime as ClockIcon,
  Videocam as VideoIcon
} from "@mui/icons-material";
import { useNavigate } from "@tanstack/react-router";
import type { EventInfoProps } from "../meeting/EventInfo";
import { createEvent } from "../../lib/api";
import toast from "react-hot-toast";
import { tzMap } from "../../constants/timezones";
import { rules } from "../../constants/phoneNumberRules";

type Props = {
  event: EventInfoProps;
  selectedDate: Date;
  selectedTime: string;
  onBack: () => void;
  eventTypeId: number | null;
  timezone?: string;
};

const BookingForm = ({ event, selectedDate, selectedTime, onBack, eventTypeId, timezone = "Asia/Kathmandu" }: Props) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+61");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const getEndTime = () => {
    const [hourMin, meridiem] = selectedTime.split(" ");
    const [hours, minutes] = hourMin.split(":").map(Number);
    let adjustedHours = hours;
    if (meridiem === "PM" && adjustedHours !== 12) adjustedHours += 12;
    if (meridiem === "AM" && adjustedHours === 12) adjustedHours = 0;

    const start = new Date(selectedDate);
    start.setHours(adjustedHours, minutes, 0, 0);
    return new Date(start.getTime() + event.duration * 60 * 1000);
  };

  // Helper function to format date/time as YYYY-MM-DDTHH:mm:ss
  // Backend will handle timezone conversion using toUTCDate
  const formatDateTime = (date: Date, time: string): string => {
    const [hourMin, meridiem] = time.split(" ");
    const [hours, minutes] = hourMin.split(":").map(Number);
    let adjustedHours = hours;
    if (meridiem === "PM" && adjustedHours !== 12) adjustedHours += 12;
    if (meridiem === "AM" && adjustedHours === 12) adjustedHours = 0;

    // Get date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hourStr = String(adjustedHours).padStart(2, '0');
    const minuteStr = String(minutes).padStart(2, '0');

    // Format as YYYY-MM-DDTHH:mm:ss (backend will convert using timezone)
    return `${year}-${month}-${day}T${hourStr}:${minuteStr}:00`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventTypeId) {
      toast.error("Event type ID is required");
      return;
    }
    
    if (!validatePhoneNumber()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Format start time (backend will handle timezone conversion)
      const startAt = formatDateTime(selectedDate, selectedTime);

      // Calculate end time by adding duration
      const [hourMin, meridiem] = selectedTime.split(" ");
      const [hours, minutes] = hourMin.split(":").map(Number);
      let adjustedHours = hours;
      if (meridiem === "PM" && adjustedHours !== 12) adjustedHours += 12;
      if (meridiem === "AM" && adjustedHours === 12) adjustedHours = 0;

      // Calculate end time
      const totalMinutes = (adjustedHours * 60 + minutes) + event.duration;
      const endHours = Math.floor(totalMinutes / 60);
      const endMins = totalMinutes % 60;
      const endHours12 = endHours > 12 ? endHours - 12 : (endHours === 0 ? 12 : endHours);
      const endMeridiem = endHours >= 12 ? 'PM' : 'AM';
      const endTimeStr = `${String(endHours12).padStart(2, '0')}:${String(endMins).padStart(2, '0')} ${endMeridiem}`;
      
      // Format end time (backend will handle timezone conversion)
      const endAt = formatDateTime(selectedDate, endTimeStr);

      await createEvent({
        event_type_id: eventTypeId,
        start_at: startAt,
        end_at: endAt,
        timezone,
        status: "CREATED",
        name,
        email,
        phone: phoneNumber ? `${countryCode}${phoneNumber}` : undefined,
        description: notes || undefined,
      });

      const endTime = getEndTime();
      const startTimeFormatted = selectedTime;
      const endTimeFormatted = endTime.toLocaleTimeString("default", { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: true 
      });
      const timeRangeStr = `${startTimeFormatted} - ${endTimeFormatted}`;
      
      // Redirect to confirmation page
      navigate({
        to: "/bookings/confirmation",
        search: {
          title: event.title,
          organizer: event.organizer,
          date: selectedDate,
          timeRange: timeRangeStr,
          timezone,
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to schedule event"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const endTime = getEndTime();

  const validatePhoneNumber = () => {
    if (!phoneNumber) {
      setPhoneError(null);
      return true;
    }

    const rule = rules[countryCode];

    if (!rule) return true;

    if (phoneNumber.length < rule.min || phoneNumber.length > rule.max) {
      setPhoneError(`Phone number must be ${rule.min} digits`);
      return false;
    }

    if (rule.startsWith && !rule.startsWith.test(phoneNumber)) {
      setPhoneError(rule.message || "Invalid phone number format");
      return false;
    }

    setPhoneError(null);
    return true;
  };

  return (
    <div className="grid h-full w-full grid-cols-1 md:grid-cols-2 overflow-hidden rounded-2xl bg-white">
      {/* Left */}
      <div className="border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{event.organizer}</p>
          <h1 className="mt-2 text-xl font-semibold text-gray-900">
            {event.title}
          </h1>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <ClockIcon sx={{ fontSize: 16 }} />
              <span>{event.duration} min</span>
            </div>
            <div className="flex items-center gap-2">
              <VideoIcon sx={{ fontSize: 16 }} />
              <span>{event.description}</span>
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            {selectedTime} –{" "}
            {endTime.toLocaleTimeString("default", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            ,{" "}
            {selectedDate.toLocaleDateString("default", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <p className="text-sm text-gray-500">
            {tzMap[timezone] ? `${tzMap[timezone]} Time` : timezone}
          </p>
        </div>

        <button
          onClick={onBack}
          className="mt-6 text-sm text-blue-600 hover:underline"
        >
          ← Back to Timeslots selection
        </button>
      </div>

      {/* Right */}
      <form
        onSubmit={handleSubmit}
        className="p-6 flex flex-col justify-between overflow-y-auto"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Phone Number
            </label>

            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="rounded border border-gray-300 p-2 text-sm bg-white"
              >
                <option value="+977">🇳🇵 +977</option>
                <option value="+91">🇮🇳 +91</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
              </select>

              <input
                type="tel"
                inputMode="numeric"
                value={phoneNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");

                  // Auto-strip leading 0 for AU / UK
                  if (
                    (countryCode === "+61" || countryCode === "+44") &&
                    value.startsWith("0")
                  ) {
                    value = value.slice(1);
                  }

                  setPhoneNumber(value);
                  if (phoneError) validatePhoneNumber();
                }}
                placeholder="XXXXXXXXXX"
                className={`flex-1 rounded border p-2 text-sm ${
                  phoneError ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
          </div>
          {phoneError && (
            <p className="mt-1 text-xs text-red-600">{phoneError}</p>
          )}


          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Please share anything that will help prepare for our meeting
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            />
          </div>
        </div>

        <button
          disabled={isSubmitting}
          className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Scheduling..." : "Schedule Event"}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
