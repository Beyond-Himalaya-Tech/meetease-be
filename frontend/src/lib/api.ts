export const API_BASE_URL =
  ((import.meta as { env?: { VITE_API_URL?: string } })?.env?.VITE_API_URL as string | undefined) ??
  "http://localhost:8000/api/v1";

export interface User {
  id: number;
  email: string;
  name?: string | null;
  picture?: string | null;
  google_account_id?: string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const { getToken, bootstrapAuth } = await import("../auth/storage");
  
  // Get token from memory
  let token = getToken();
  
  // If no token, try to get one from refresh token
  if (!token) {
    await bootstrapAuth();
    token = getToken();
  }
  
  if (!token) {
    throw new Error("Not authenticated");
  }

  // Make request with token
  let response = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  // If token expired, refresh and retry once
  if (response.status === 401) {
    await bootstrapAuth();
    const newToken = getToken();
    
    if (newToken && newToken !== token) {
      // Retry with new token
      response = await fetch(url, {
        ...options,
        headers: {
          "Authorization": `Bearer ${newToken}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include",
      });
    }
  }

  return response;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  picture?: string;
}

export interface Contact {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone?: string | null;
  tag?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreateContactData = Omit<Contact, "id" | "created_at" | "updated_at">;

export type UpdateContactData = Partial<Pick<Contact, "name" | "email" | "phone" | "tag">>;

export interface EventType {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  duration_minutes: number;
  client_tag?: string | null;
  is_active: boolean;
}

export type CreateEventTypeData = {
  title: string;
  description?: string;
  duration_minutes: number;
  client_tag?: string;
  is_active?: boolean;
};

export type UpdateEventTypeData = {
  title?: string;
  description?: string;
  duration_minutes?: number;
  client_tag?: string;
  is_active?: boolean;
};

export interface Availability {
  id: number;
  user_id: number;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time: string; // Format: "HH:MM:SS" or "HH:MM"
  end_time: string; // Format: "HH:MM:SS" or "HH:MM"
  created_at?: string;
  updated_at?: string;
}

export type CreateAvailabilityData = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type UpdateAvailabilityData = {
  start_time?: string;
  end_time?: string;
};

export async function getUser(): Promise<User> {
  const response = await fetchWithAuth(`${API_BASE_URL}/users`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch user");
  }

  const data = await response.json();
  return data.data;
}

export async function createContact(payload: CreateContactData): Promise<Contact> {
  const response = await fetchWithAuth(`${API_BASE_URL}/contacts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create contact");
  }

  const data = await response.json();
  return data.data;
}

export async function getContacts(notNull: string | null, eventType: number | null): Promise<Contact[]> {
  let url = `${API_BASE_URL}/contacts?`;
  const params: string[] = [];

  if (notNull)
    params.push(`not_null=${encodeURIComponent(notNull)}`);

  if (eventType)
    params.push(`event_type=${encodeURIComponent(eventType)}`);

  url += params.join("&");

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch contacts");
  }

  const data = await response.json();
  return data.data;
}

export async function deleteContact(id: number): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/contacts/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete contact");
  }
}

export async function updateContact(id: number, updateData: UpdateContactData): Promise<Contact> {
  const response = await fetchWithAuth(`${API_BASE_URL}/contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update contact");
  }

  const data = await response.json();
  return data.data;
}

export async function updateUser(userId: number, updateData: UpdateUserData): Promise<User> {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update user");
  }

  const data = await response.json();
  return data.data;
}

export async function getEventTypes(): Promise<EventType[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/event-types`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch event types");
  }

  const data = await response.json();
  return data.data;
}

export async function createEventType(payload: CreateEventTypeData): Promise<EventType> {
  const response = await fetchWithAuth(`${API_BASE_URL}/event-types`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create event type");
  }

  const data = await response.json();
  return data.data;
}

export async function updateEventType(id: number, updateData: UpdateEventTypeData): Promise<EventType> {
  const response = await fetchWithAuth(`${API_BASE_URL}/event-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update event type");
  }

  const data = await response.json();
  return data.data;
}

export async function getEventTypeById(id: number): Promise<EventType> {
  const response = await fetchWithAuth(`${API_BASE_URL}/event-types/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch event type");
  }

  const data = await response.json();
  return data.data;
}

export async function getEventAvailabilities(id: number, date: string): Promise<string[]> {
  // Date should already be in YYYY-MM-DD format, use it directly
  // Avoid timezone conversion that could shift the date
  const formattedDate = date; // Already in YYYY-MM-DD format from TimeSlots
  const response = await fetchWithAuth(
    `${API_BASE_URL}/event-types/availabilities/${id}/${formattedDate}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch availabilities");
  }

  const data = await response.json();
  // Ensure we always return an array
  // Backend may return {} when no availabilities, so check if it's an array
  const result = data.data;
  if (Array.isArray(result)) {
    return result;
  }
  // If it's an object (empty response) or anything else, return empty array
  return [];
}

export async function getAvailabilities(): Promise<Availability[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/availabilities`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch availabilities");
  }

  const data = await response.json();
  return data.data || [];
}

export async function getAvailabilitiesByUserId(userId: number): Promise<Availability[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/availabilities/user/${userId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch availabilities");
  }

  const data = await response.json();
  return data.data || [];
}

export async function createAvailability(payload: CreateAvailabilityData): Promise<Availability> {
  const response = await fetchWithAuth(`${API_BASE_URL}/availabilities`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create availability");
  }

  const data = await response.json();
  return data.data;
}

export async function updateAvailability(
  id: number,
  updateData: UpdateAvailabilityData
): Promise<Availability> {
  const response = await fetchWithAuth(`${API_BASE_URL}/availabilities/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update availability");
  }

  const data = await response.json();
  return data.data;
}

export async function deleteAvailability(id: number): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/availabilities/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete availability");
  }
}

// ----- Events (bookings) -----

export interface Event {
  id: number;
  user_id: number;
  event_type_id: number;
  contact_id: number;
  start_at: string;
  end_at: string;
  timezone: string;
  location_link: string;
  status: "CREATED" | "COMPLETED" | "CANCELLED";
  calendar_event_id: string;
  description?: string | null;
  is_rescheduled: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CreateEventData = {
  event_type_id: number;
  start_at: string; // ISO8601 date string
  end_at?: string; // ISO8601 date string (optional)
  timezone: string;
  status?: "CREATED" | "COMPLETED" | "CANCELLED";
  name: string;
  email: string;
  phone?: string;
  description?: string;
};

export async function createEvent(payload: CreateEventData): Promise<Event> {
  const response = await fetchWithAuth(`${API_BASE_URL}/events`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create event");
  }

  const data = await response.json();
  return data.data;
}

// Shape returned by GET /events/filter/:event
export interface FilteredEvent {
  id: number;
  start_at: string;
  end_at: string;
  meet_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  location_link: string;
  description?: string | null;
  is_rescheduled: boolean;
  event_status: string;
  event_types?: string | null;
  event_types_description?: string | null;
  duration_minutes?: number | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_tag?: string | null;
}

export type GroupedEventsResponse = Record<string, FilteredEvent[]>;

export type EventFilterType = "upcoming" | "past" | "range";

export async function getFilteredEvents(
  filter: EventFilterType,
  options?: { from_date?: string; to_date?: string },
): Promise<GroupedEventsResponse> {
  let url = `${API_BASE_URL}/events/filter/${filter}`;

  if (filter === "range" && options?.from_date && options?.to_date) {
    const params = new URLSearchParams({
      from_date: options.from_date,
      to_date: options.to_date,
    });
    url += `?${params.toString()}`;
  }

  const response = await fetchWithAuth(url);

  // If there are no events, backend returns 404 with "No user events"
  if (response.status === 404) {
    return {};
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch events");
  }

  const data = await response.json();
  return (data.data ?? {}) as GroupedEventsResponse;
}

export async function getEventById(id: number): Promise<Event> {
  const response = await fetchWithAuth(`${API_BASE_URL}/events/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch event");
  }

  const data = await response.json();
  return data.data;
}

export type RescheduleEventData = {
  start_at: string; // ISO8601 date string
  end_at?: string; // ISO8601 date string (optional)
  timezone: string;
};

export async function rescheduleEvent(id: number, payload: RescheduleEventData): Promise<Event> {
  const response = await fetchWithAuth(`${API_BASE_URL}/events/reschedule/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to reschedule event");
  }

  const data = await response.json();
  return data.data;
}

export async function cancelEvent(id: number): Promise<Event> {
  const response = await fetchWithAuth(`${API_BASE_URL}/events/cancel/${id}`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to cancel event");
  }

  const data = await response.json();
  return data.data;
}
