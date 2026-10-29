// src/lib/locations.ts
import raw from "../../data/locations.json";
import { hasCoords, type MappableLocation, type ServiceLocation } from "./geo";

export const ALL_LOCATIONS = raw.locations as ServiceLocation[];

/**
 * Locations that may be drawn as pins.
 * Production: only entries with coordinates AND coordsVerified === true.
 * Development: set NEXT_PUBLIC_SHOW_UNVERIFIED=true to also show unverified pins (greyed out).
 */
export function getMappable(showUnverified = false): MappableLocation[] {
  return ALL_LOCATIONS.filter(hasCoords).filter((location) => {
    if (showUnverified) return true;
    return location.status !== "unverified" && location.coordsVerified;
  });
}
