import { API_BASE_URL } from "../lib/api";

let accessToken: string | null = null;

export const getToken = () => accessToken;

export const setToken = (token: string) => {
  accessToken = token;
};

export const clearToken = () => {
  accessToken = null;
};

export const isAuthenticated = () => !!accessToken;

export async function bootstrapAuth() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return;

    const data: { access_token?: string } = await res.json();
    if (data.access_token) {
      setToken(data.access_token);
    }
  } catch {
    // Ignore errors; user will appear logged out until they sign in again.
  }
}


