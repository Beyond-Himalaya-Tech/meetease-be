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

export async function getContacts(userId: number): Promise<Contact[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/contacts?user_id=${userId}`);

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
