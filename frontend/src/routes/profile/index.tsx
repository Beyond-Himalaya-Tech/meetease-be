import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import {
  Avatar,
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
import DefaultLayout from "../../layouts/DefaultLayout";
import { requireAuth } from "../../auth/requireAuth";
import { getUser, updateUser, type User, type UpdateUserData } from "../../lib/api";
import PageHeader from "../../components/layout/PageHeader";

export const Route = createFileRoute("/profile/")({
  beforeLoad: requireAuth,
  component: ProfileRoute,
});

function ProfileRoute() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);
        const userData = await getUser();
        if (!cancelled) {
          setUser(userData);
          setEditForm({
            name: userData.name || "",
            email: userData.email || "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load profile");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUser();
    
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEditClick = () => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      const updateData: UpdateUserData = {
        name: editForm.name.trim() || undefined,
        email: editForm.email.trim() || undefined,
      };
      const updatedUser = await updateUser(user.id, updateData);
      setUser(updatedUser);
      setIsEditDialogOpen(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
      });
    }
    setIsEditDialogOpen(false);
  };

  if (loading) {
    return (
      <DefaultLayout>
        <Box
          sx={{
            maxWidth: "72rem",
            mx: "auto",
            width: "100%",
            py: { xs: 4, sm: 6 },
            px: { xs: 2, sm: 0 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary">Loading...</Typography>
        </Box>
      </DefaultLayout>
    );
  }

  if (error && !user) {
    return (
      <DefaultLayout>
        <Box
          sx={{
            maxWidth: "72rem",
            mx: "auto",
            width: "100%",
            py: { xs: 4, sm: 6 },
            px: { xs: 2, sm: 0 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="error">Error: {error}</Typography>
        </Box>
      </DefaultLayout>
    );
  }

  if (!user) {
    return null;
  }

  // Split name into first and last name for display
  const nameParts = (user.name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <DefaultLayout>
      <Box
        sx={{
          maxWidth: "72rem",
          mx: "auto",
          width: "100%",
          py: { xs: 4, sm: 6 },
          px: { xs: 2, sm: 0 },
        }}
      >
        <Box sx={{ mb: 3 }}>
          <PageHeader
            title="Profile"
            subtitle="Your account information"
          />
        </Box>

        {/* Profile Header Section */}
        <Box
          sx={{
            mb: 2.5,
            borderRadius: 1.5,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            px: 2.5,
            py: 2.25,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Avatar
                src={user.picture || undefined}
                alt={user.name || user.email}
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: 32,
                  bgcolor: "grey.300",
                  color: "text.primary",
                }}
              >
                {(user.name || user.email)[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {user.name || "No name set"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {user.email}
                </Typography>
                {user.google_account_id && (
                  <Typography variant="caption" color="text.secondary">
                    Google Account ID: {user.google_account_id}
                  </Typography>
                )}
              </Box>
            </Box>

            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={handleEditClick}
              disabled={saving}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Edit
            </Button>
          </Box>
        </Box>

        {/* Personal Information Section */}
        <Box
          sx={{
            mb: 2.5,
            borderRadius: 1.5,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            px: 2.5,
            py: 2.25,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Personal information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                First Name
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {firstName || "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                Last Name
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {lastName || "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                Email address
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {user.email}
              </Typography>
            </Grid>
            {user.google_account_id && (
              <Grid item xs={12} md={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase" }}
                >
                  Google Account ID
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-all" }}>
                  {user.google_account_id}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Account Details Section */}
        <Box
          sx={{
            borderRadius: 1.5,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            px: 2.5,
            py: 2.25,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Account details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                User ID
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {user.id}
              </Typography>
            </Grid>
            {user.created_at && (
              <Grid item xs={12} md={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase" }}
                >
                  Member Since
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
              </Grid>
            )}
            {user.updated_at && (
              <Grid item xs={12} md={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase" }}
                >
                  Last Updated
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {new Date(user.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Edit Dialog Modal (MUI Dialog) */}
        <Dialog
          open={isEditDialogOpen}
          onClose={handleCancel}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box component="form" sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                label="Name"
                value={editForm.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                size="small"
                disabled={saving}
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                size="small"
                disabled={saving}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCancel}
              disabled={saving}
              variant="outlined"
              size="small"
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="contained"
              size="small"
              sx={{ textTransform: "none" }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DefaultLayout>
  );
}
