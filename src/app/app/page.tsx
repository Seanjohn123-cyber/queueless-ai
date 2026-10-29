"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { MobileNavigation } from "@/components/MobileNavigation";
import { useUserLocation } from "@/hooks/useUserLocation";
import { AREAS, formatKm, isOutsidePilot, rankLocations, type ServiceKind } from "@/lib/geo";
import { ALL_LOCATIONS, getMappable } from "@/lib/locations";
import {
  SearchIcon,
  PassportIcon,
  DriverLicenceIcon,
  SparklesIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  BellIcon,
  LocationsIcon,
  TripsIcon,
} from "@/components/icons";

const LagosMap = dynamic(() => import("@/components/LagosMap"), {
  ssr: false,
  loading: () => <div className="map-loading" role="status">Loading Lagos map…</div>,
});

type ServiceFilter = "all" | ServiceKind;

const examples = [
  "I need to renew my Nigerian passport in Lagos.",
  "I need to renew my driver's licence in Lagos.",
  "Help me prepare for both a passport and licence renewal.",
  "I need help with my National Identity Number (NIN).",
];

const categoryPills = [
  { id: "all" as const, label: "All Services", icon: SparklesIcon, bg: "#eff6ff", color: "#2563eb" },
  { id: "passport" as const, label: "Passport (NIS)", icon: PassportIcon, bg: "#f0fdf4", color: "#16a34a" },
  { id: "drivers_licence" as const, label: "Licence (FRSC)", icon: DriverLicenceIcon, bg: "#fff7ed", color: "#ea580c" },
  { id: "nin" as const, label: "National ID", icon: TripsIcon, bg: "#faf5ff", color: "#9333ea" },
  { id: "offices" as const, label: "Offices", icon: LocationsIcon, bg: "#f8fafc", color: "#475569" },
];

export default function AppHome() {
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("all");
  const [areaFilter, setAreaFilter] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState("");
  const userLocation = useUserLocation();

  const mapLocations = useMemo(() => getMappable(process.env.NEXT_PUBLIC_SHOW_UNVERIFIED === "true").filter((location) =>
    (serviceFilter === "all" || location.service === serviceFilter) && (!areaFilter || location.area === areaFilter)
  ), [areaFilter, serviceFilter]);

  const locations = useMemo(() => {
    return rankLocations(userLocation.position, ALL_LOCATIONS, { service: serviceFilter }).filter(({ location }) =>
      !areaFilter || location.area === areaFilter
    );
  }, [areaFilter, serviceFilter, userLocation.position]);

  const nearest = locations.find((item) => item.distanceKm !== null);
  const visibleLocations = showAll || areaFilter || serviceFilter !== "all" ? locations : locations.slice(0, 4);

  function chooseService(filter: ServiceFilter, prompt?: string) {
    setServiceFilter(filter);
    setShowAll(false);
    if (prompt) setMessage(prompt);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (message.trim().length >= 3) {
      window.location.href = `/plan?task=${encodeURIComponent(message)}`;
    }
  }

  const locationError = userLocation.status === "denied"
    ? "Location permission was denied. Choose an area below or use the Ikeja demo location."
    : userLocation.status === "unavailable" || userLocation.status === "error"
      ? "Your browser could not provide a location. Choose an area below or use the Ikeja demo location."
      : "";

  return (
    <main className="app-shell home-shell">
      {/* Top Greeting Bar */}
      <header className="home-user-header">
        <Link href="/profile" className="user-profile-badge" aria-label="View Profile">
          <div className="user-avatar-wrap">
            <span className="user-avatar-initials">Q</span>
            <span className="user-avatar-status" />
          </div>
          <div className="user-greeting-text">
            <small>Good Morning</small>
            <strong>Lagos Resident</strong>
          </div>
        </Link>
        <div className="home-header-tools">
          <Link href="/notifications" className="icon-circle-button" aria-label="Notifications">
            <BellIcon />
            <span className="notification-dot" />
          </Link>
        </div>
      </header>

      {/* Hero Banner / Highlight Card */}
      <section className="app-featured-banner">
        <div className="featured-banner-content">
          <span className="featured-tag">Lagos Pilot · Official Guide</span>
          <h2>Get it done in fewer trips.</h2>
          <p>Prepare official requirements, verify open centres, and check transparent wait times.</p>
          <div className="featured-action-row">
            <Link href="/plan" className="featured-primary-btn">
              <span>Start Visit Plan</span>
              <ArrowRightIcon />
            </Link>
            <Link href="/report" className="featured-sub-btn">
              Report Visit
            </Link>
          </div>
        </div>
        <div className="featured-banner-decoration" aria-hidden="true">
          <div className="deco-circle-1" />
          <div className="deco-circle-2" />
        </div>
      </section>

      {/* Search Bar with Blue Action Button */}
      <section className="home-search-section">
        <form className="dribbble-search-box" onSubmit={submit}>
          <span className="search-box-icon" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            id="task"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Search service, passport, licence, NIN..."
            maxLength={2000}
          />
          <button
            type="submit"
            className="search-box-action-btn"
            disabled={message.trim().length < 3}
            aria-label="Build visit plan"
          >
            <ArrowRightIcon />
          </button>
        </form>
      </section>

      {/* Category Icons Row */}
      <section className="home-categories-section">
        <div className="section-title-simple">
          <h3>Services &amp; Categories</h3>
          <Link href="/plan" className="view-all-link">Plan Wizard ↗</Link>
        </div>
        <div className="category-bubbles-scroll">
          {categoryPills.map((cat) => {
            const Icon = cat.icon;
            const isSelected = (cat.id === "all" && serviceFilter === "all" && !message) ||
              (cat.id === serviceFilter);
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-bubble-item ${isSelected ? "is-selected" : ""}`}
                onClick={() => {
                  if (cat.id === "all" || cat.id === "passport" || cat.id === "drivers_licence") {
                    chooseService(cat.id, cat.id === "passport" ? examples[0] : cat.id === "drivers_licence" ? examples[1] : "");
                  } else if (cat.id === "nin") {
                    setMessage(examples[3]);
                  } else if (cat.id === "offices") {
                    const el = document.getElementById("offices-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <span className="bubble-icon-container" style={{ backgroundColor: cat.bg, color: cat.color }}>
                  <Icon />
                </span>
                <span className="bubble-label">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Lagos Map Card */}
      <section className="dashboard-map-card" aria-label="Lagos service centres map">
        <div className="dashboard-map-header">
          <div className="map-header-left">
            <span className="map-badge-dot" />
            <strong>Lagos Radar Map</strong>
          </div>
          <span className="map-badge-count">{mapLocations.length} centres mapped</span>
        </div>
        <div className="dashboard-map-view">
          <LagosMap userPosition={userLocation.position} locations={mapLocations} />
        </div>
      </section>

      {/* Government Offices Directory List */}
      <section className="home-offices-section" id="offices-section">
        <div className="section-title-simple">
          <h3>Government Offices</h3>
          <span className="offices-count-badge">{locations.length} Available</span>
        </div>

        {/* Quick Filter Bar */}
        <div className="dashboard-filters">
          <label className="dashboard-area-filter">
            <span className="filter-dot" aria-hidden="true">●</span>
            <select
              aria-label="Filter by Lagos area"
              value={areaFilter}
              onChange={(event) => { setAreaFilter(event.target.value); setShowAll(true); }}
            >
              <option value="">All Lagos Districts</option>
              {AREAS.map((area) => <option key={area.name} value={area.name}>{area.name}</option>)}
            </select>
          </label>
          <button
            type="button"
            className={`reported-filter ${showAll ? "is-active" : ""}`}
            onClick={() => setShowAll((current) => !current)}
          >
            <span>{showAll ? "Show fewer" : "View all"}</span>
          </button>
        </div>

        {/* Transparent Queue Callout */}
        <div className="queue-unknown-banner">
          <div className="queue-banner-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <strong>Transparent Wait Times</strong>
            <p>Queue wait estimates are never guessed. They appear once verified visitors submit live reports.</p>
          </div>
        </div>

        {/* Office Cards Stack */}
        <div className="dribbble-office-cards">
          {!locations.length ? (
            <p className="empty-results">No offices match this district filter.</p>
          ) : (
            visibleLocations.map(({ location, distanceKm }) => {
              const isPassport = location.service === "passport";
              return (
                <Link className="dribbble-office-card" href={`/location/${location.id}`} key={location.id}>
                  <div className={`office-avatar-box ${isPassport ? "box-passport" : "box-licence"}`}>
                    {isPassport ? <PassportIcon /> : <DriverLicenceIcon />}
                  </div>
                  <div className="office-card-body">
                    <div className="office-card-header-row">
                      <strong className="office-card-title">{location.name}</strong>
                      <span className="office-rating-pill">
                        ★ 4.9
                      </span>
                    </div>
                    <small className="office-card-address">
                      <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
                        <path d="M8 15s5-5.1 5-9A5 5 0 1 0 3 6c0 3.9 5 9 5 9Zm0-6.8A2.2 2.2 0 1 1 8 3.8a2.2 2.2 0 0 1 0 4.4Z" />
                      </svg>
                      {location.address ?? `${location.area}, Lagos`}
                    </small>
                    <div className="office-card-footer">
                      <span className={`office-status-pill ${location.status === "unverified" ? "pill-unverified" : "pill-verified"}`}>
                        {location.status === "unverified" ? "Community Report" : "Verified NIS/FRSC"}
                      </span>
                      {distanceKm !== null && (
                        <span className="office-distance-pill">{formatKm(distanceKm)} away</span>
                      )}
                    </div>
                  </div>
                  <div className="office-card-action">
                    <span className="circle-arrow-btn">
                      <ChevronRightIcon />
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {nearest && (
          <p className="nearest-note">
            Closest centre: <strong>{nearest.location.name}</strong> ({formatKm(nearest.distanceKm!)} straight-line).
          </p>
        )}

        {/* Location Tools */}
        <section className="dashboard-location-tools" aria-label="Location settings">
          <div className="location-actions">
            <button className="outline-button" type="button" onClick={userLocation.request} disabled={userLocation.status === "loading"}>
              {userLocation.status === "loading" ? "Locating…" : "Use My GPS Location"}
            </button>
            <button className="text-button" type="button" onClick={userLocation.useDemo}>
              Demo (Ikeja)
            </button>
          </div>
          {userLocation.label && (
            <p className="location-status">
              Current: <strong>{userLocation.label}</strong>
              {userLocation.accuracyM ? ` (±${userLocation.accuracyM}m)` : ""}
            </p>
          )}
          {locationError && <p className="location-status location-warning" role="status">{locationError}</p>}
          {userLocation.position && isOutsidePilot(userLocation.position) && (
            <p className="notice notice-question" role="status">
              Outside Lagos pilot boundary. Try using the Ikeja demo location.
            </p>
          )}
        </section>
      </section>

      <footer className="site-footer">
        <p>QueueLess AI · Lagos Service Pilot · Official Requirements Verified</p>
      </footer>

      <MobileNavigation active="home" />
    </main>
  );
}