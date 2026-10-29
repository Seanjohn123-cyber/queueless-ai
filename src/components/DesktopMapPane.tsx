"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { ALL_LOCATIONS, getMappable } from "@/lib/locations";
import { formatKm } from "@/lib/geo";

const LagosMap = dynamic(() => import("@/components/LagosMap"), {
  ssr: false,
  loading: () => <div className="map-loading" role="status">Loading interactive Lagos map…</div>,
});

export function DesktopMapPane() {
  const userLocation = useUserLocation();
  const [selectedService, setSelectedService] = useState<"all" | "passport" | "drivers_licence">("all");

  const mapLocations = useMemo(() => {
    return getMappable(true).filter((loc) =>
      selectedService === "all" ? true : loc.service === selectedService
    );
  }, [selectedService]);

  return (
    <aside className="flow-desktop-map-pane" aria-label="Interactive Lagos Map">
      {/* Map Header Floating Controls */}
      <div className="flow-map-header-bar">
        <div className="flow-map-title-wrap">
          <span className="flow-radar-pulse" aria-hidden="true" />
          <div>
            <strong>Lagos Service Radar</strong>
            <small>{mapLocations.length} government offices active</small>
          </div>
        </div>

        <div className="flow-map-filter-pills" role="radiogroup" aria-label="Filter Map Offices">
          <button
            type="button"
            className={`flow-filter-btn ${selectedService === "all" ? "is-active" : ""}`}
            onClick={() => setSelectedService("all")}
          >
            All Offices
          </button>
          <button
            type="button"
            className={`flow-filter-btn ${selectedService === "passport" ? "is-active" : ""}`}
            onClick={() => setSelectedService("passport")}
          >
            Passport (NIS)
          </button>
          <button
            type="button"
            className={`flow-filter-btn ${selectedService === "drivers_licence" ? "is-active" : ""}`}
            onClick={() => setSelectedService("drivers_licence")}
          >
            Licence (FRSC)
          </button>
        </div>
      </div>

      {/* Full Canvas Interactive Leaflet Map */}
      <div className="flow-map-canvas-wrap">
        <LagosMap userPosition={userLocation.position} locations={mapLocations} />
      </div>

      {/* Floating Bottom Card: Quick Guidance & GPS */}
      <div className="flow-map-floating-drawer">
        <div className="flow-drawer-stats">
          <div className="drawer-stat-item">
            <span className="drawer-stat-label">Coverage</span>
            <strong>12 Districts</strong>
          </div>
          <div className="drawer-stat-item">
            <span className="drawer-stat-label">Queue Verification</span>
            <strong className="text-emerald">Community Verified</strong>
          </div>
          <div className="drawer-stat-item">
            <span className="drawer-stat-label">GPS Status</span>
            <strong>{userLocation.position ? "Active Location" : "Demo (Ikeja)"}</strong>
          </div>
        </div>

        <div className="flow-drawer-actions">
          <button
            type="button"
            className="drawer-gps-btn"
            onClick={userLocation.request}
            disabled={userLocation.status === "loading"}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2" />
            </svg>
            <span>{userLocation.status === "loading" ? "Locating…" : "Recenter to My GPS"}</span>
          </button>
          <Link href="/report" className="drawer-report-btn">
            Report Office Wait ↗
          </Link>
        </div>
      </div>
    </aside>
  );
}
