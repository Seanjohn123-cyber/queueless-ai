import type { PlanResult, SavedTrip } from "./plan-types";

const STORAGE_KEY = "queueless.saved-trips.v1";

export function readTrips(): SavedTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value as SavedTrip[] : [];
  } catch {
    return [];
  }
}

export function saveTrip(plan: PlanResult): SavedTrip {
  const trips = readTrips();
  const trip: SavedTrip = {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "upcoming",
    plan,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([trip, ...trips]));
  return trip;
}

export function updateTripStatus(id: string, status: SavedTrip["status"]): SavedTrip[] {
  const trips = readTrips().map((trip) => trip.id === id ? { ...trip, status } : trip);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  return trips;
}

export function deleteTrip(id: string): SavedTrip[] {
  const trips = readTrips().filter((trip) => trip.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  return trips;
}
