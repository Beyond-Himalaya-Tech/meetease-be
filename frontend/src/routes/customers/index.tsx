import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "@tanstack/react-router";
import CustomerFormModal from "../../components/customers/CustomerFormModal";
import CustomersList from "../../components/customers/CustomersList";
import { type Customer } from "../../components/customers/types";
import PageHeader from "../../components/layout/PageHeader";
import DefaultLayout from "../../layouts/DefaultLayout";
import { requireAuth } from "../../auth/requireAuth";
import {
  useUser,
  useContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from "../../lib/queries";
import { type Contact } from "../../lib/api";

export const Route = createFileRoute("/customers/")({
  beforeLoad: requireAuth,
  component: CustomersRoute,
});

function mapContactToCustomer(contact: Contact): Customer {
  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone ?? "",
    tag: contact.tag ?? "",
    eventType: "",
    company: "",
    jobTitle: "",
    timezone: "",
  };
}

function CustomersRoute() {
  const { data: user } = useUser();
  const { data: contacts = [], isLoading: loading, error: queryError } = useContacts(
    user?.id ?? 0
  );
  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();
  const deleteContactMutation = useDeleteContact();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);

  const customers = contacts.map(mapContactToCustomer);
  const error = queryError instanceof Error ? queryError.message : null;

  const openAddDialog = () => {
    setDialogMode("add");
    setEditingCustomer(null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
    setDialogMode("add");
  };

  return (
    <DefaultLayout>
      <section className="max-w-6xl mx-auto w-full pt-2 pb-4 sm:pt-3 sm:pb-6 px-4 sm:px-0">
        <PageHeader
          title="Contacts"
          subtitle="Manage people you meet with and build relationships."
          rightSlot={
            <Button
              variant="contained"
              size="small"
              sx={{ borderRadius: 999, px: 2.5, py: 0.75, fontSize: "0.75rem", fontWeight: 600 }}
              onClick={openAddDialog}
            >
              + Add contact
            </Button>
          }
        />

        {loading ? (
          <Box sx={{ py: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography color="text.secondary" variant="body2">
              Loading contacts...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ py: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        ) : customers.length === 0 ? (
          <Box
            sx={{
              mt: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              px: { xs: 3, md: 6 },
              py: { xs: 4, md: 6 },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 4,
            }}
          >
            <Box sx={{ maxWidth: 520 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                Stay organized as you build relationships
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Contacts are automatically created and updated when a meeting is booked. View
                meeting history, access key details, and schedule your next conversation — all in
                one place.
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: 999,
                    px: 2.5,
                    py: 0.75,
                    fontSize: "0.8rem",
                  }}
                  onClick={openAddDialog}
                >
                  + Add contact
                </Button>
                <Button
                  component={RouterLink}
                  to="/scheduling"
                  variant="contained"
                  size="small"
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    py: 0.75,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Book your first meeting
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                flexShrink: 0,
                alignSelf: { xs: "stretch", md: "center" },
                height: 160,
                bgcolor: "grey.50",
                borderRadius: 3,
              }}
            />
          </Box>
        ) : (
          <CustomersList
            customers={customers}
            onEdit={(customer) => {
              setDialogMode("edit");
              setEditingCustomer(customer);
              setIsDialogOpen(true);
            }}
            onDelete={async (customer) => {
              setPendingDelete(customer);
            }}
          />
        )}
      </section>

      <CustomerFormModal
        isOpen={isDialogOpen}
        onClose={closeDialog}
        initialData={
          dialogMode === "edit" && editingCustomer
            ? {
                name: editingCustomer.name,
                email: editingCustomer.email,
                phone: editingCustomer.phone,
                tag: editingCustomer.tag,
                eventType: "",
                company: "",
                jobTitle: "",
                timezone: "",
              }
            : undefined
        }
        onSubmit={async (data) => {
          if (!user?.id) {
            return;
          }
          if (dialogMode === "add") {
            createContactMutation.mutate(
              {
                user_id: user.id,
                name: data.name,
                email: data.email,
                phone: data.phone || undefined,
                tag: data.tag || undefined,
              },
              {
                onSuccess: () => {
                  setIsDialogOpen(false);
                  setEditingCustomer(null);
                  setDialogMode("add");
                },
              }
            );
          } else if (dialogMode === "edit" && editingCustomer) {
            updateContactMutation.mutate(
              {
                id: editingCustomer.id,
                data: {
                  name: data.name,
                  email: data.email,
                  phone: data.phone || undefined,
                  tag: data.tag || undefined,
                },
              },
              {
                onSuccess: () => {
                  setIsDialogOpen(false);
                  setEditingCustomer(null);
                  setDialogMode("add");
                },
              }
            );
          }
        }}
        availableTags={[...new Set(customers.map((c: Customer) => c.tag).filter(Boolean))] as string[]}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete contact</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Are you sure you want to delete{" "}
            <strong>{pendingDelete?.name || "this contact"}</strong>? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setPendingDelete(null)}
            size="small"
            variant="text"
          >
            Cancel
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            sx={{ textTransform: "none" }}
            onClick={() => {
              if (!pendingDelete) {
                setPendingDelete(null);
                return;
              }
              deleteContactMutation.mutate(pendingDelete.id, {
                onSuccess: () => {
                  setPendingDelete(null);
                },
              });
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DefaultLayout>
  );
}

