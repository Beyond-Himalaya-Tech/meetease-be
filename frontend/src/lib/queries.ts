import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUser,
  getContacts,
  getEventTypes,
  getEventTypeById,
  getAvailabilities,
  getAvailabilitiesByUserId,
  getEventAvailabilities,
  getFilteredEvents,
  createContact,
  updateContact,
  deleteContact,
  createEventType,
  updateEventType,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  createEvent,
  rescheduleEvent,
  cancelEvent,
  updateUser,
  type User,
  type Contact,
  type EventType,
  type Availability,
  type CreateContactData,
  type UpdateContactData,
  type CreateEventTypeData,
  type UpdateEventTypeData,
  type CreateAvailabilityData,
  type UpdateAvailabilityData,
  type CreateEventData,
  type RescheduleEventData,
  type UpdateUserData,
  type EventFilterType,
} from "./api";

// Re-export types for convenience
export type { Contact, User, EventType, Availability };
import toast from "react-hot-toast";

// Query Keys
export const queryKeys = {
  user: ["user"] as const,
  contacts: (notNull: string | null, eventType: number | null, currentPage?: number, size?: number) =>
    ["contacts", { notNull, eventType, currentPage, size }] as const,
  eventTypes: ["eventTypes"] as const,
  eventTypesPaginated: (currentPage?: number, size?: number) =>
    ["eventTypes", currentPage, size] as const,
  eventType: (id: number) => ["eventType", id] as const,
  availabilities: ["availabilities"] as const,
  userAvailabilities: (userId: number) => ["availabilities", "user", userId] as const,
  eventAvailabilities: (id: number, date: string) =>
    ["eventAvailabilities", id, date] as const,
  filteredEvents: (
    filter: EventFilterType,
    params?: { from_date?: string; to_date?: string; current_page?: number; size?: number }
  ) => ["events", "filter", filter, params] as const,
};

// User Queries
export function useUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: getUser,
    staleTime: 1000 * 60 * 10, // 10 minutes - user data doesn't change often
  });
}

// Contacts Queries
export function useContacts(
  notNull: string | null,
  eventType: number | null,
  currentPage?: number,
  size?: number
) {
  return useQuery({
    queryKey: queryKeys.contacts(notNull, eventType, currentPage, size),
    queryFn: () => getContacts(notNull, eventType, currentPage, size),
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactData) => createContact(data),
    onSuccess: () => {
      // Invalidate all contacts queries to refetch
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create contact");
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateContactData }) =>
      updateContact(id, data),
    onSuccess: () => {
      // Invalidate contacts query
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update contact");
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteContact(id),
    onSuccess: () => {
      // Invalidate contacts query
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete contact");
    },
  });
}

// Event Types Queries
export function useEventTypes(currentPage?: number, size?: number) {
  return useQuery({
    queryKey: [...queryKeys.eventTypes, currentPage, size],
    queryFn: () => getEventTypes(currentPage, size),
  });
}

export function useEventType(id: number) {
  return useQuery({
    queryKey: queryKeys.eventType(id),
    queryFn: () => getEventTypeById(id),
    enabled: !!id,
  });
}

export function useCreateEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventTypeData) => createEventType(data),
    onSuccess: () => {
      // Invalidate all event types queries (all pages)
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] });
      toast.success("Event type created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create event type");
    },
  });
}

export function useUpdateEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEventTypeData }) =>
      updateEventType(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes });
      queryClient.invalidateQueries({ queryKey: queryKeys.eventType(variables.id) });
      toast.success("Event type updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update event type");
    },
  });
}

// Availabilities Queries
export function useAvailabilities() {
  return useQuery({
    queryKey: queryKeys.availabilities,
    queryFn: getAvailabilities,
  });
}

export function useUserAvailabilities(userId: number) {
  return useQuery({
    queryKey: queryKeys.userAvailabilities(userId),
    queryFn: () => getAvailabilitiesByUserId(userId),
    enabled: !!userId,
  });
}

export function useEventAvailabilities(id: number, date: string) {
  return useQuery({
    queryKey: queryKeys.eventAvailabilities(id, date),
    queryFn: () => getEventAvailabilities(id, date),
    enabled: !!id && !!date,
  });
}

export function useCreateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAvailabilityData) => createAvailability(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availabilities });
      // Invalidate all user availabilities queries
      queryClient.invalidateQueries({ queryKey: ["availabilities", "user"] });
      toast.success("Availability created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create availability");
    },
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAvailabilityData }) =>
      updateAvailability(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availabilities });
      toast.success("Availability updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update availability");
    },
  });
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.availabilities });
      toast.success("Availability deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete availability");
    },
  });
}

// Events Queries
export function useFilteredEvents(
  filter: EventFilterType,
  params?: { from_date?: string; to_date?: string; current_page?: number; size?: number }
) {
  return useQuery({
    queryKey: queryKeys.filteredEvents(filter, params),
    queryFn: () => getFilteredEvents(filter, params),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventData) => createEvent(data),
    onSuccess: () => {
      // Invalidate all event filters
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create event");
    },
  });
}

export function useRescheduleEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RescheduleEventData }) =>
      rescheduleEvent(id, data),
    onSuccess: () => {
      // Invalidate all event filters
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event rescheduled successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reschedule event");
    },
  });
}

export function useCancelEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelEvent(id),
    onSuccess: () => {
      // Invalidate all event filters
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event cancelled successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel event");
    },
  });
}

// User Update Mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UpdateUserData }) =>
      updateUser(userId, data),
    onSuccess: (updatedUser) => {
      // Update user cache
      queryClient.setQueryData(queryKeys.user, updatedUser);
      toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

