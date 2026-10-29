const STORAGE_KEY = "queueless.saved-locations.v1";

export function readSavedLocationIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function toggleSavedLocation(id: string): string[] {
  const current = readSavedLocationIds();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
