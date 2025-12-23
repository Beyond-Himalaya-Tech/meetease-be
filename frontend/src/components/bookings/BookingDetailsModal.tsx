import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Link as MuiLink,
  Stack,
} from "@mui/material";
import { useCancelEvent } from "../../lib/queries";
import RescheduleModal from "./RescheduleModal";

type Booking = {
  id: number;
  /** ISO start date-time string */
  start: string;
  dateLabel: string;
  timeRange: string;
  attendee: string;
  eventType: string;
  eventStatus: string;
  isRescheduled: boolean;
  hosts: number;
  nonHosts: number;
  location: string;
  meetingLink: string;
};

type BookingDetailsModalProps = {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const BookingDetailsModal = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}: BookingDetailsModalProps) => {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const cancelMutation = useCancelEvent();
  const open = isOpen && !!booking;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(booking?.meetingLink ?? "");
      }
    } catch {
      // ignore for now
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    
    try {
      await cancelMutation.mutateAsync(booking.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  };

  const handleReschedule = () => {
    setRescheduleOpen(true);
  };

  const handleRescheduleSuccess = () => {
    setRescheduleOpen(false);
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 0.5 },
      }}
    >
      {booking && (
        <>
          <DialogTitle sx={{ pb: 1.5 }}>
            <Typography variant="h6" fontSize={16} fontWeight={600}>
              Meeting details
            </Typography>
          </DialogTitle>

          <DialogContent dividers sx={{ pt: 0.5 }}>
            <Stack spacing={1.25}>
              <Typography variant="subtitle2" fontSize={14} fontWeight={600}>
                {booking.attendee}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Event type{" "}
                <Typography
                  component="span"
                  variant="caption"
                  fontWeight={600}
                  color="text.primary"
                >
                  {booking.eventType}
                </Typography>
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {booking.dateLabel} • {booking.timeRange}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Location: {booking.location}
              </Typography>

              <Box mt={1}>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.primary"
                >
                  Meeting link
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ sm: "center" }}
                  justifyContent={{ sm: "space-between" }}
                  mt={0.5}
                >
                  <MuiLink
                    href={booking.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    variant="caption"
                    sx={{ wordBreak: "break-all" }}
                  >
                    {booking.meetingLink}
                  </MuiLink>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCopyLink}
                    sx={{ borderRadius: 999, textTransform: "none" }}
                  >
                    Copy link
                  </Button>
                </Stack>
              </Box>
            </Stack>
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
              sx={{ textTransform: "none" }}
            >
              Close
            </Button>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                sx={{ borderRadius: 999, textTransform: "none" }}
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleReschedule}
                disabled={cancelMutation.isPending}
                sx={{ borderRadius: 999, textTransform: "none" }}
              >
                Reschedule
              </Button>
            </Box>
          </DialogActions>
        </>
      )}
      <RescheduleModal
        booking={booking}
        isOpen={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        onSuccess={handleRescheduleSuccess}
      />
    </Dialog>
  );
};

export type { Booking };
export default BookingDetailsModal;


