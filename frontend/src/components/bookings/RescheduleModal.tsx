import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import Calendar from "../meeting/Calendar";
import TimeSlots from "../meeting/TimeSlots";
import { useRescheduleEvent } from "../../lib/queries";
import { getEventById } from "../../lib/api";
import type { Booking } from "./BookingDetailsModal";

type RescheduleModalProps = {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const RescheduleModal = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}: RescheduleModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>("Asia/Kathmandu");
  const [eventTypeId, setEventTypeId] = useState<number | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);

  const rescheduleMutation = useRescheduleEvent();

  // Fetch event details to get event_type_id
  useEffect(() => {
    if (isOpen && booking) {
      setIsLoadingEvent(true);
      getEventById(booking.id)
        .then((event) => {
          setEventTypeId(event.event_type_id);
          setTimezone(event.timezone);
          // Set initial date/time from booking
          const startDate = new Date(booking.start);
          setSelectedDate(startDate);
        })
        .catch(() => {
          // Handle error silently or show toast
        })
        .finally(() => {
          setIsLoadingEvent(false);
        });
    }
  }, [isOpen, booking]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setSelectedTime(null);
      setEventTypeId(null);
    }
  }, [isOpen]);

  const handleReschedule = async () => {
    if (!booking || !selectedDate || !selectedTime) return;

    try {
      // Format date/time as YYYY-MM-DDTHH:mm:ss
      const [hourMin, meridiem] = selectedTime.split(" ");
      const [hours, minutes] = hourMin.split(":").map(Number);
      let adjustedHours = hours;
      if (meridiem === "PM" && adjustedHours !== 12) adjustedHours += 12;
      if (meridiem === "AM" && adjustedHours === 12) adjustedHours = 0;

      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const hourStr = String(adjustedHours).padStart(2, "0");
      const minuteStr = String(minutes).padStart(2, "0");

      const startAt = `${year}-${month}-${day}T${hourStr}:${minuteStr}:00`;

      await rescheduleMutation.mutateAsync({
        id: booking.id,
        data: {
          start_at: startAt,
          timezone: timezone,
        },
      });

      onSuccess();
      onClose();
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  };

  const open = isOpen && !!booking;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 0.5, height: "80vh" },
      }}
    >
      {booking && (
        <>
          <DialogTitle sx={{ pb: 1.5 }}>
            <Typography variant="h6" fontSize={16} fontWeight={600}>
              Reschedule Meeting
            </Typography>
          </DialogTitle>

          <DialogContent dividers sx={{ pt: 0.5, display: "flex", p: 0 }}>
            {isLoadingEvent ? (
              <div className="flex-1 flex items-center justify-center">
                <Typography variant="body2" color="text.secondary">
                  Loading...
                </Typography>
              </div>
            ) : (
              <>
                <div className="flex-1 border-r border-gray-200">
                  <Calendar
                    selectedDate={selectedDate}
                    onSelectDate={(date) => {
                      setSelectedDate(date);
                      setSelectedTime(null); // Reset time when date changes
                    }}
                    timezone={timezone}
                    onTimezoneChange={setTimezone}
                  />
                </div>
                <div className="flex-1">
                  <TimeSlots
                    selectedDate={selectedDate}
                    onSelectTime={setSelectedTime}
                    eventTypeId={eventTypeId || undefined}
                  />
                </div>
              </>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2.5,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              onClick={onClose}
              size="small"
              disabled={rescheduleMutation.isPending}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={handleReschedule}
              disabled={
                !selectedDate ||
                !selectedTime ||
                rescheduleMutation.isPending ||
                isLoadingEvent
              }
              sx={{ borderRadius: 999, textTransform: "none" }}
            >
              {rescheduleMutation.isPending ? "Rescheduling..." : "Reschedule"}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default RescheduleModal;

