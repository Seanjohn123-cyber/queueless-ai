"use client";
// src/hooks/useUserLocation.ts
// Asks the browser for the user's position ONLY when request() is called (on a button tap).
// The position stays in React state. It is never stored or sent to a server.
import { useCallback, useState } from "react";
import { AREAS, DEMO_LOCATION, type LatLng } from "@/lib/geo";

export type GeoStatus = "idle" | "loading" | "ready" | "denied" | "unavailable" | "error";
export type GeoSource = "gps" | "area" | "demo";

export interface UserLocationState {
  status: GeoStatus;
  position: LatLng | null;
  source: GeoSource | null;
  label: string | null;
  accuracyM: number | null;
}

const EMPTY: UserLocationState = {
  status: "idle",
  position: null,
  source: null,
  label: null,
  accuracyM: null,
};

export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>(EMPTY);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ ...EMPTY, status: "unavailable" });
      return;
    }
    setState({ ...EMPTY, status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          status: "ready",
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          source: "gps",
          label: "Your location (approximate)",
          accuracyM: Math.round(pos.coords.accuracy),
        }),
      (err) =>
        setState({
          ...EMPTY,
          status:
            err.code === err.PERMISSION_DENIED
              ? "denied"
              : err.code === err.POSITION_UNAVAILABLE
              ? "unavailable"
              : "error",
        }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 }
    );
  }, []);

  const chooseArea = useCallback((name: string) => {
    const area = AREAS.find((a) => a.name === name);
    if (!area) return;
    setState({
      status: "ready",
      position: { lat: area.lat, lng: area.lng },
      source: "area",
      label: `Approximate area centre: ${area.name}`,
      accuracyM: null,
    });
  }, []);

  const useDemo = useCallback(() => {
    setState({
      status: "ready",
      position: { lat: DEMO_LOCATION.lat, lng: DEMO_LOCATION.lng },
      source: "demo",
      label: "Approximate demo location (Ikeja)",
      accuracyM: null,
    });
  }, []);

  const clear = useCallback(() => setState(EMPTY), []);

  return { ...state, request, chooseArea, useDemo, clear };
}
