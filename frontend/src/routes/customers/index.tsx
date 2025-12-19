import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import toast from "react-hot-toast";
import CustomerFormModal from "../../components/customers/CustomerFormModal";
import CustomersList from "../../components/customers/CustomersList";
import { type Customer } from "../../components/customers/types";
import PageHeader from "../../components/layout/PageHeader";
import DefaultLayout from "../../layouts/DefaultLayout";
import { requireAuth } from "../../auth/requireAuth";
import {
  createContact,
  deleteContact,
  getContacts,
  updateContact,
  type Contact,
  getUser,
} from "../../lib/api";

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadContacts() {
      try {
        setLoading(true);
        setError(null);
        const user = await getUser();
        const contacts = await getContacts(user.id);
        if (!cancelled) {
          setUserId(user.id);
          setCustomers(contacts.map(mapContactToCustomer));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load contacts");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadContacts();

    return () => {
      cancelled = true;
    };
  }, []);

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
      <section className="max-w-6xl mx-auto w-full py-4 sm:py-6 px-4 sm:px-0">
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
          if (!userId) {
            toast.error("User not loaded yet. Please try again.");
            return;
          }
          try {
            if (dialogMode === "add") {
              const payload = {
                user_id: userId,
                name: data.name,
                email: data.email,
                phone: data.phone || undefined,
                tag: data.tag || undefined,
              };
              await createContact(payload);
              toast.success("Contact added successfully");
            } else if (dialogMode === "edit" && editingCustomer) {
              await updateContact(editingCustomer.id, {
                name: data.name,
                email: data.email,
                phone: data.phone || undefined,
                tag: data.tag || undefined,
              });
              toast.success("Contact updated successfully");
            }

            const contacts = await getContacts(userId);
            setCustomers(contacts.map(mapContactToCustomer));
            setIsDialogOpen(false);
            setEditingCustomer(null);
            setDialogMode("add");
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Failed to save contact";
            toast.error(message);
          }
        }}
        availableTags={[...new Set(customers.map((c) => c.tag))].filter(Boolean)}
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
            onClick={async () => {
              if (!userId || !pendingDelete) {
                setPendingDelete(null);
                return;
              }
              try {
                await deleteContact(pendingDelete.id);
                toast.success("Contact deleted");
                const contacts = await getContacts(userId);
                setCustomers(contacts.map(mapContactToCustomer));
              } catch (err) {
                const message =
                  err instanceof Error ? err.message : "Failed to delete contact";
                toast.error(message);
              } finally {
                setPendingDelete(null);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DefaultLayout>
  );
}

