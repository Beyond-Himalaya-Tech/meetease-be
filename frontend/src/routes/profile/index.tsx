import { createFileRoute } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
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
import { useUser, useUpdateUser } from "../../lib/queries";
import PageHeader from "../../components/layout/PageHeader";

export const Route = createFileRoute("/profile/")({
  beforeLoad: requireAuth,
  component: ProfileRoute,
});

function ProfileRoute() {
  const { data: user, isLoading: loading, error: queryError } = useUser();
  const updateUserMutation = useUpdateUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  const handleEditClick = () => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleSave = () => {
    if (!user) return;

    const updateData = {
      name: editForm.name.trim() || undefined,
      email: editForm.email.trim() || undefined,
    };
    
    updateUserMutation.mutate(
      { userId: user.id, data: updateData },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
        },
      }
    );
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

  const error = queryError instanceof Error ? queryError.message : null;
  
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
          pt: { xs: 2, sm: 3 },
          pb: { xs: 4, sm: 6 },
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
              disabled={updateUserMutation.isPending}
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
                disabled={updateUserMutation.isPending}
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
                disabled={updateUserMutation.isPending}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCancel}
              disabled={updateUserMutation.isPending}
              variant="outlined"
              size="small"
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateUserMutation.isPending}
              variant="contained"
              size="small"
              sx={{ textTransform: "none" }}
            >
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DefaultLayout>
  );
}
