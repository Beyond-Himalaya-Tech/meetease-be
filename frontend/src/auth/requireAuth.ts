import { redirect } from "@tanstack/react-router";
import { bootstrapAuth, isAuthenticated } from "./storage";

export async function requireAuth() {
  if (!isAuthenticated()) {
    await bootstrapAuth();
  }

  if (!isAuthenticated()) {
    throw redirect({ to: "/" });
  }
}


