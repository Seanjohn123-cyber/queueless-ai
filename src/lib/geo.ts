// src/lib/geo.ts
// Pure helpers: distance, ranking, pilot-area check, directions link.
// No network calls, no API keys.

export type LatLng = { lat: number; lng: number };
export type ServiceKind = "passport" | "drivers_licence";
export type LocationStatus = "unverified" | "address_verified" | "fully_verified";

export interface ServiceLocation {
  id: string;
  service: ServiceKind;
  name: string;
  address: string | null;
  area: string;
  lat: number | null;
  lng: number | null;
  coordsVerified: boolean;
  status: LocationStatus;
  sourceUrl: string;
  sourceNote: string;
}

export type MappableLocation = ServiceLocation & LatLng;

export interface RankedLocation {
  location: ServiceLocation;
  /** Straight-line distance in km, or null if the office has no coordinates yet. */
  distanceKm: number | null;
}

/** Rough centre of Lagos. Used only for the "is the user inside the pilot area" check. */
export const LAGOS_CENTRE: LatLng = { lat: 6.5244, lng: 3.3792 };
/** Beyond this distance from the Lagos centre we tell the user the pilot is Lagos-only. */
export const PILOT_MAX_KM = 70;

export const DEMO_LOCATION: LatLng & { label: string } = {
  lat: 6.6018,
  lng: 3.3515,
  label: "Ikeja (demo)",
};

/**
 * APPROXIMATE area centres, for rough "nearest" ranking when the user picks an area
 * instead of sharing GPS. These are NOT office coordinates. Check them on a map and
 * adjust if you like. Names match the `area` field loosely, but are only used for the picker.
 */
export const AREAS: Array<{ name: string } & LatLng> = [
  { name: "Agege", lat: 6.6226, lng: 3.319 },
  { name: "Akoka (UNILAG)", lat: 6.5158, lng: 3.3989 },
  { name: "Akowonjo", lat: 6.613, lng: 3.301 },
  { name: "Alimosho", lat: 6.5833, lng: 3.25 },
  { name: "Festac", lat: 6.4667, lng: 3.2833 },
  { name: "Ikeja", lat: 6.6018, lng: 3.3515 },
  { name: "Ikoyi", lat: 6.4549, lng: 3.4246 },
  { name: "Lagos Island", lat: 6.4541, lng: 3.3947 },
  { name: "Ojo", lat: 6.4667, lng: 3.1833 },
  { name: "Ojodu", lat: 6.641, lng: 3.373 },
  { name: "Oshodi", lat: 6.555, lng: 3.343 },
  // Approximate ward centre from a public locality map; not an office coordinate.
  { name: "Oto-Awori", lat: 6.4836, lng: 3.1217 },
];

const toRad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function hasCoords(l: ServiceLocation): l is MappableLocation {
  return typeof l.lat === "number" && typeof l.lng === "number";
}

/** Sort by distance (offices without coordinates go last, in their original order). */
export function rankLocations(
  user: LatLng | null,
  locations: ServiceLocation[],
  opts: { service?: ServiceKind | "all"; limit?: number } = {}
): RankedLocation[] {
  const filtered = locations.filter(
    (l) => !opts.service || opts.service === "all" || l.service === opts.service
  );
  const ranked: RankedLocation[] = filtered.map((location) => ({
    location,
    distanceKm:
      user && hasCoords(location) && location.coordsVerified && location.status !== "unverified"
        ? haversineKm(user, location)
        : null,
  }));
  ranked.sort((a, b) => {
    if (a.distanceKm === null && b.distanceKm === null) return 0;
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });
  return opts.limit ? ranked.slice(0, opts.limit) : ranked;
}

/** True when the user is too far from Lagos for the pilot to be useful. */
export function isOutsidePilot(user: LatLng | null): boolean {
  return !!user && haversineKm(user, LAGOS_CENTRE) > PILOT_MAX_KM;
}

/**
 * Link that opens Google Maps directions from the user's current position.
 * Needs no API key. Uses coordinates when known, otherwise the written address.
 */
export function directionsUrl(l: ServiceLocation): string {
  const destination = hasCoords(l) && l.coordsVerified
    ? `${l.lat},${l.lng}`
    : encodeURIComponent(`${l.address ?? l.name}, ${l.area}, Lagos, Nigeria`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
}

export function canShowDirections(l: ServiceLocation): boolean {
  const hasUsableAddress = Boolean(l.address && !/exact address not given/i.test(l.address));
  return (l.coordsVerified && l.status !== "unverified") || hasUsableAddress;
}

export function formatKm(km: number): string {
  return km < 1 ? "under 1 km" : `${km.toFixed(1)} km`;
}
