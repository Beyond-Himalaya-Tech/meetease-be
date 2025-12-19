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
} from "@mui/material";
import type { Customer } from "./types";

type CustomerFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Customer, "id">) => void;
  availableTags: string[];
  initialData?: Omit<Customer, "id">;
};

const emptyForm: Omit<Customer, "id"> = {
  name: "",
  email: "",
  phone: "",
  tag: "",
  eventType: "",
  company: "",
  jobTitle: "",
  timezone: "",
};

const CustomerFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  availableTags,
  initialData,
}: CustomerFormModalProps) => {
  const [form, setForm] = useState<Omit<Customer, "id">>(initialData ?? emptyForm);

  const handleChange =
    (field: keyof Omit<Customer, "id">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSelectChange =
    (field: keyof Omit<Customer, "id">) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  // Only these fields are relevant when creating a contact
  const { name, email, phone, tag } = form;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      ...emptyForm,
      name,
      email,
      phone,
      tag,
    });
  };

  const handleCancel = () => {
    setForm(emptyForm);
    onClose();
  };

  // Keep form in sync when opening in edit mode with different initialData
  useEffect(() => {
    if (isOpen) {
      setForm(initialData ?? emptyForm);
    }
  }, [isOpen, initialData]);

  return (
    <Dialog
      open={isOpen}
      onClose={handleCancel}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Contact Info
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                value={name}
                onChange={handleChange("name")}
                required
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={handleChange("email")}
                required
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone number"
                value={phone}
                onChange={handleChange("phone")}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tag"
                value={tag}
                onChange={handleChange("tag")}
                size="small"
                fullWidth
                placeholder="e.g. VIP, Lead"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCancel}
            size="small"
            variant="text"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="small"
            variant="contained"
            sx={{ borderRadius: 999, px: 3, textTransform: "none", fontWeight: 600 }}
          >
            {initialData ? "Update contact" : "Add contact"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CustomerFormModal;
