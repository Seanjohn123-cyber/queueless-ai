"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileNavigation, MobileScreenHeader } from "@/components/MobileNavigation";
import { ALL_LOCATIONS } from "@/lib/locations";
import { readSavedLocationIds } from "@/lib/saved-locations";
import { LocationsIcon, ChevronRightIcon, PassportIcon, DriverLicenceIcon } from "@/components/icons";

export default function SavedLocationsPage() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readSavedLocationIds());
  }, []);

  const locations = ALL_LOCATIONS.filter((location) => ids.includes(location.id));

  return (
    <main className="mobile-app-shell saved-locations-page">
      <MobileScreenHeader title="Saved Offices" backHref="/profile" />
      <p className="section-explainer">Saved on this device. Always confirm operational hours prior to visiting.</p>

      {locations.length ? (
        <div className="location-cards-stack">
          {locations.map((location) => {
            const isPassport = location.service === "passport";
            return (
              <Link className="results-location-card" href={`/location/${location.id}`} key={location.id}>
                <span className={`results-location-icon ${isPassport ? "icon-passport" : "icon-licence"}`}>
                  {isPassport ? <PassportIcon /> : <DriverLicenceIcon />}
                </span>
                <span className="results-location-info">
                  <strong>{location.name}</strong>
                  <small>{location.area} · {location.status.replaceAll("_", " ")}</small>
                  <em>{location.address ?? "No street address listed"}</em>
                </span>
                <b className="results-chevron"><ChevronRightIcon /></b>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mobile-empty-state">
          <span className="empty-icon-wrap" aria-hidden="true"><LocationsIcon /></span>
          <h1>No saved offices</h1>
          <p>Tap "Save location" on any government office page to access it quickly here.</p>
          <Link className="mobile-primary-link" href="/locations">Browse offices</Link>
        </div>
      )}

      <MobileNavigation active="locations" />
    </main>
  );
}
