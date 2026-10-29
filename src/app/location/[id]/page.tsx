"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { MobileNavigation } from "@/components/MobileNavigation";
import { SaveLocationButton } from "@/components/SaveLocationButton";
import { useUserLocation } from "@/hooks/useUserLocation";
import { canShowDirections, directionsUrl, formatKm, hasCoords, haversineKm, isOutsidePilot, type ServiceKind } from "@/lib/geo";
import { ALL_LOCATIONS, getMappable } from "@/lib/locations";
import corpus from "@/data/services.json";
import { ChevronLeftIcon, ClockIcon, ArrowRightIcon } from "@/components/icons";

const LagosMap = dynamic(() => import("@/components/LagosMap"), {
  ssr: false,
  loading: () => <div className="map-loading" role="status">Loading Lagos map…</div>,
});

const SERVICE_IDS: Record<ServiceKind, string> = {
  passport: "ng_standard_passport_renewal",
  drivers_licence: "ng_national_drivers_licence_renewal",
};

export default function LocationTrackerPage() {
  const params = useParams<{ id: string }>();
  const location = ALL_LOCATIONS.find((item) => item.id === params.id);
  const userLocation = useUserLocation();
  const service = location && corpus.services.find((item) => item.id === SERVICE_IDS[location.service]);
  const mapLocations = useMemo(() => getMappable(process.env.NEXT_PUBLIC_SHOW_UNVERIFIED === "true"), []);
  const locationWithCoordinates = location && hasCoords(location) ? location : null;
  const distance = userLocation.position && locationWithCoordinates && location?.coordsVerified && location.status !== "unverified"
    ? haversineKm(userLocation.position, locationWithCoordinates)
    : null;

  if (!location || !service) {
    return (
      <main className="app-shell tracker-shell">
        <p className="notice notice-error">That location is not in the Lagos pilot directory.</p>
        <Link href="/" className="mobile-primary-link">Back to home</Link>
      </main>
    );
  }

  const isVerified = location.status !== "unverified";
  const reportServiceId = SERVICE_IDS[location.service];

  return (
    <main className="app-shell tracker-shell">
      <header className="tracker-topbar">
        <Link className="back-circle" href="/" aria-label="Back to locations">
          <ChevronLeftIcon />
        </Link>
        <span className="office-service-badge">
          {location.service === "passport" ? "NIS Office" : "FRSC DLC"}
        </span>
      </header>

      <div className="tracker-title-row">
        <div>
          <p className="eyebrow">{location.service === "passport" ? "Passport Service" : "Driver’s Licence Centre"}</p>
          <h1>{location.name}</h1>
          <p className="tracker-subtitle">{location.address ?? "Street address not verified"}</p>
        </div>
        <Link className="dark-action" href={`/report?service=${encodeURIComponent(reportServiceId)}&location=${encodeURIComponent(location.id)}`}>
          <span>Report wait</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <section className="tracker-queue-card" aria-label="Queue status">
        <div className="queue-unknown-pill">
          <ClockIcon />
          <span>Queue wait unknown</span>
        </div>
        <div className="queue-card-content">
          <div className="queue-number-block">
            <span>LIVE STATUS</span>
            <strong>Unreported</strong>
          </div>
          <div className="queue-details">
            <p><strong>People in queue</strong><span>Awaiting report</span></p>
            <p><strong>Estimated wait</strong><span>Not guessed</span></p>
          </div>
        </div>
        <p className="queue-card-note">
          QueueLess does not generate artificial wait estimates. Live wait times are only published when verified visitors submit community observations.
        </p>
      </section>

      <section className="tracker-progress-card" aria-labelledby="tracker-progress-title">
        <p className="section-kicker">Preparation checklist</p>
        <h2 id="tracker-progress-title">Visit milestones</h2>
        <ol className="tracker-progress-list">
          <li className="tracker-current">
            <span>1</span>
            <div>
              <strong>Gather documents &amp; requirements</strong>
              <small>{service.required_documents.length ? `${service.required_documents.length} verified documents in official checklist` : "Standard identification required"}</small>
            </div>
            <span className="tracker-state">In progress</span>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Confirm office hours &amp; status</strong>
              <small>{isVerified ? "Official agency location" : "Community reported; verify prior to departure"}</small>
            </div>
            <span className="tracker-state">To do</span>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Complete in-person biometric capture</strong>
              <small>Arrive during morning intake hours</small>
            </div>
            <span className="tracker-state">To do</span>
          </li>
          <li>
            <span>4</span>
            <div>
              <strong>Report your wait time</strong>
              <small>
                <Link href={`/report?service=${encodeURIComponent(reportServiceId)}&location=${encodeURIComponent(location.id)}`}>
                  Help fellow citizens by sharing what happened
                </Link>
              </small>
            </div>
            <span className="tracker-state">To do</span>
          </li>
        </ol>
      </section>

      <section className="tracker-location-card" aria-labelledby="location-details-title">
        <div className="section-title-row">
          <div>
            <p className="section-kicker">Centre details</p>
            <h2 id="location-details-title">{location.area}, Lagos</h2>
          </div>
          <span className={`status-pill ${isVerified ? "status-verified" : ""}`}>
            {location.status.replaceAll("_", " ")}
          </span>
        </div>

        <p className="tracker-address">{location.address ?? "No verified street address listed."}</p>
        {!isVerified && (
          <p className="location-warning-card">
            ⚠️ Community reported location: Please verify operating hours with NIS or FRSC before travelling.
          </p>
        )}
        {distance !== null && (
          <p className="nearest-note">Approx. {formatKm(distance)} away (direct GPS line).</p>
        )}

        <div className="tracker-location-actions">
          <SaveLocationButton id={location.id} />
          {canShowDirections(location) ? (
            <a className="primary-action" href={directionsUrl(location)} target="_blank" rel="noreferrer">
              <span>{isVerified ? "Open in Google Maps" : "Check address in Maps"}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="disabled-action" title="Directions become available after address is verified">
              Directions unavailable
            </span>
          )}
          <a className="source-link" href={location.sourceUrl} target="_blank" rel="noreferrer">
            Source link ↗
          </a>
        </div>
      </section>

      <section className="tracker-map-section" aria-label="Map">
        <div className="map-frame tracker-map-frame">
          <LagosMap userPosition={userLocation.position} locations={mapLocations} />
        </div>
        <div className="tracker-location-controls">
          <button className="outline-button" type="button" onClick={userLocation.request} disabled={userLocation.status === "loading"}>
            {userLocation.status === "loading" ? "Locating…" : "Update GPS location"}
          </button>
        </div>
      </section>

      <MobileNavigation active="locations" />
    </main>
  );
}
