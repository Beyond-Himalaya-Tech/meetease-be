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
  MenuItem,
} from "@mui/material";
import type { Customer } from "./types";
import { rules } from "../../constants/phoneNumberRules";

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
  initialData,
}: CustomerFormModalProps) => {
  const [form, setForm] = useState<Omit<Customer, "id">>(
    initialData ?? emptyForm
  );

  const [countryCode, setCountryCode] = useState("+61");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  /* ---------------- PHONE VALIDATION ---------------- */
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
      setPhoneError(rule.message || "Invalid phone number");
      return false;
    }

    setPhoneError(null);
    return true;
  };

  /* ---------------- FORM HANDLERS ---------------- */
  const handleChange =
    (field: keyof Omit<Customer, "id">) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validatePhoneNumber()) return;

    await onSubmit({
      ...emptyForm,
      ...form,
      phone: phoneNumber ? `${countryCode}${phoneNumber}` : "",
    });

    handleCancel();
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setCountryCode("+61");
    setPhoneNumber("");
    setPhoneError(null);
    onClose();
  };

  /* ---------------- EDIT MODE SYNC ---------------- */
  useEffect(() => {
    if (!isOpen) return;

    if (initialData?.phone) {
      const match = initialData.phone.match(/^(\+\d{1,3})(\d+)$/);
      if (match) {
        setCountryCode(match[1]);
        setPhoneNumber(match[2]);
      }
    } else {
      setCountryCode("+61");
      setPhoneNumber("");
    }

    setForm(initialData ?? emptyForm);
  }, [isOpen, initialData]);

  return (
    <Dialog open={isOpen} onClose={handleCancel} fullWidth maxWidth="sm">
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
                value={form.name}
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
                value={form.email}
                onChange={handleChange("email")}
                required
                size="small"
                fullWidth
              />
            </Grid>

            {/* PHONE FIELD */}
            <Grid item xs={12} sm={6}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <TextField
                    select
                    label="Code"
                    value={countryCode}
                    size="small"
                    fullWidth
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    <MenuItem value="+977">🇳🇵 +977</MenuItem>
                    <MenuItem value="+91">🇮🇳 +91</MenuItem>
                    <MenuItem value="+61">🇦🇺 +61</MenuItem>
                    <MenuItem value="+1">🇺🇸 +1</MenuItem>
                    <MenuItem value="+44">🇬🇧 +44</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={8}>
                  <TextField
                    label="Phone number"
                    value={phoneNumber}
                    size="small"
                    fullWidth
                    error={!!phoneError}
                    helperText={phoneError}
                    inputProps={{ inputMode: "numeric" }}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");

                      if (
                        (countryCode === "+61" || countryCode === "+44") &&
                        value.startsWith("0")
                      ) {
                        value = value.slice(1);
                      }

                      setPhoneNumber(value);
                      if (phoneError) validatePhoneNumber();
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Tag"
                value={form.tag}
                onChange={handleChange("tag")}
                size="small"
                fullWidth
                placeholder="e.g. VIP, Lead"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancel} size="small">
            Cancel
          </Button>
          <Button
            type="submit"
            size="small"
            variant="contained"
            sx={{
              borderRadius: 999,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {initialData ? "Update contact" : "Add contact"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CustomerFormModal;
