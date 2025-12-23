import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { type EventType } from "../../lib/api";
import { useUpdateEventType } from "../../lib/queries";

type EditEventTypeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  eventType: EventType | null;
  onUpdated: () => Promise<void> | void;
};

const EditEventTypeDialog = ({
  isOpen,
  onClose,
  eventType,
  onUpdated,
}: EditEventTypeDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<number | "">("");
  const [clientTag, setClientTag] = useState("");
  const [isActive, setIsActive] = useState(true);
  const updateEventTypeMutation = useUpdateEventType();

  // Pre-fill form when eventType changes
  useEffect(() => {
    if (eventType && isOpen) {
      setTitle(eventType.title || "");
      setDescription(eventType.description || "");
      setDuration(eventType.duration_minutes || "");
      setClientTag(eventType.client_tag || "");
      setIsActive(eventType.is_active ?? true);
    }
  }, [eventType, isOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!eventType || !title || !duration) return;

    updateEventTypeMutation.mutate(
      {
        id: eventType.id,
        data: {
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          duration_minutes: typeof duration === "number" ? duration : Number(duration),
          client_tag: clientTag.trim() || undefined,
          is_active: isActive,
        },
      },
      {
        onSuccess: () => {
          if (onUpdated) {
            onUpdated();
          }
          onClose();
        },
      }
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Edit Event Type
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                required
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={description}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setDescription(e.target.value)
                }
                multiline
                rows={3}
                size="small"
                fullWidth
                placeholder="Short description shown to clients"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Duration (minutes)"
                type="number"
                value={duration}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setDuration(e.target.value === "" ? "" : Number(e.target.value))
                }
                required
                inputProps={{ min: 1 }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Client tag"
                value={clientTag}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setClientTag(e.target.value)
                }
                size="small"
                fullWidth
                placeholder="e.g. sales, support"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            disabled={updateEventTypeMutation.isPending}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateEventTypeMutation.isPending}
            variant="contained"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {updateEventTypeMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default EditEventTypeDialog;

