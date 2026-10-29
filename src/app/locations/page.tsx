"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MobileNavigation, MobileScreenHeader } from "@/components/MobileNavigation";
import { useUserLocation } from "@/hooks/useUserLocation";
import { AREAS, formatKm, rankLocations, type ServiceKind } from "@/lib/geo";
import { ALL_LOCATIONS, getMappable } from "@/lib/locations";
import {
  SearchIcon,
  PassportIcon,
  DriverLicenceIcon,
  ChevronRightIcon,
} from "@/components/icons";

const LagosMap = dynamic(() => import("@/components/LagosMap"), {
  ssr: false,
  loading: () => <div className="map-loading">Loading Lagos map…</div>,
});

export default function LocationsPage() {
  const [service, setService] = useState<"all" | ServiceKind>("all");
  const [area, setArea] = useState("");
  const userLocation = useUserLocation();
  const listed = useMemo(() => (
    rankLocations(userLocation.position, ALL_LOCATIONS, { service }).filter(
      ({ location }) => !area || location.area === area
    )
  ), [area, service, userLocation.position]);
  const pins = useMemo(() => (
    getMappable().filter(
      (location) => (service === "all" || location.service === service) && (!area || location.area === area)
    )
  ), [service, area]);

  return (
    <main className="mobile-app-shell locations-page">
      <MobileScreenHeader title="Government Offices" />

      <label className="locations-search">
        <span className="search-icon-wrap" aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          aria-label="Filter by area or district"
          placeholder="Filter by district (e.g. Ikeja, Ikoyi, Alausa)…"
          value={area}
          onChange={(event) => setArea(event.target.value)}
          list="lagos-areas"
        />
        <datalist id="lagos-areas">
          {AREAS.map((item) => <option value={item.name} key={item.name} />)}
        </datalist>
      </label>

      <div className="location-map-page">
        <LagosMap userPosition={userLocation.position} locations={pins} />
        <a className="location-map-list-link" href="#location-list">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="3" />
            <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="3" />
            <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="3" />
          </svg>
          <span>List view</span>
        </a>
      </div>

      <div className="locations-filter-row">
        <select
          aria-label="Filter service"
          value={service}
          onChange={(event) => setService(event.target.value as "all" | ServiceKind)}
        >
          <option value="all">All services (Passport &amp; Licence)</option>
          <option value="passport">Nigerian Passport (NIS)</option>
          <option value="drivers_licence">Driver’s Licence (FRSC)</option>
        </select>
        <select
          aria-label="Filter area"
          value={area}
          onChange={(event) => setArea(event.target.value)}
        >
          <option value="">All districts</option>
          {AREAS.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
        </select>
      </div>

      <section id="location-list" className="locations-list-screen">
        <div className="results-heading">
          <h2>Service Centres</h2>
          <small>{listed.length} listed</small>
        </div>
        <p className="section-explainer">Always confirm hours and operating status with the respective agency before making a journey.</p>

        <div className="location-cards-stack">
          {listed.map(({ location, distanceKm }) => {
            const isPassport = location.service === "passport";
            return (
              <Link className="results-location-card" href={`/location/${location.id}`} key={location.id}>
                <span className={`results-location-icon ${isPassport ? "icon-passport" : "icon-licence"}`}>
                  {isPassport ? <PassportIcon /> : <DriverLicenceIcon />}
                </span>
                <span className="results-location-info">
                  <strong>{location.name}</strong>
                  <small>{location.area} · {location.status === "unverified" ? "Community report" : "Verified"}</small>
                  <em>{location.address ?? "No street address listed"}</em>
                  {distanceKm !== null && <span className="distance-badge">About {formatKm(distanceKm)} away</span>}
                </span>
                <b className="results-chevron"><ChevronRightIcon /></b>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="location-near-me">
        <button
          className="mobile-secondary-button"
          type="button"
          onClick={userLocation.request}
          disabled={userLocation.status === "loading"}
        >
          {userLocation.status === "loading" ? "Locating…" : "Update with my GPS"}
        </button>
        <button className="mobile-text-link" type="button" onClick={userLocation.useDemo}>
          Use demo location (Ikeja)
        </button>
      </div>

      <MobileNavigation active="locations" />
    </main>
  );
}
