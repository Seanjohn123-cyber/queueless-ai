"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileNavigation, MobileScreenHeader } from "@/components/MobileNavigation";
import type { SavedTrip } from "@/lib/plan-types";
import { readTrips } from "@/lib/trips";
import { BellIcon, ChevronRightIcon, TripsIcon, ArrowRightIcon } from "@/components/icons";

export default function TripsPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    setTrips(readTrips());
  }, []);

  const filtered = trips.filter((trip) => trip.status === tab);

  return (
    <main className="mobile-app-shell trips-page">
      <MobileScreenHeader
        title="My Trips"
        action={
          <Link className="header-icon-link" href="/notifications" aria-label="Notifications">
            <BellIcon />
          </Link>
        }
      />

      <div className="trips-tabs" role="tablist" aria-label="Trip status">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "upcoming"}
          className={tab === "upcoming" ? "is-active" : ""}
          onClick={() => setTab("upcoming")}
        >
          Upcoming Plans ({trips.filter((t) => t.status === "upcoming").length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "past"}
          className={tab === "past" ? "is-active" : ""}
          onClick={() => setTab("past")}
        >
          Past Visits ({trips.filter((t) => t.status === "past").length})
        </button>
      </div>

      {filtered.length ? (
        <div className="trip-list">
          {filtered.map((trip) => (
            <Link className="trip-card" href={`/trips/${trip.id}`} key={trip.id}>
              <span className="trip-date-icon">
                <TripsIcon />
              </span>
              <span className="trip-card-details">
                <strong>{trip.plan.request_summary}</strong>
                <small>
                  {new Date(trip.createdAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {trip.plan.services.length} service{trip.plan.services.length === 1 ? "" : "s"}
                </small>
                <div className="trip-badge-row">
                  <span className={`trip-status-pill ${trip.status === "upcoming" ? "status-upcoming" : "status-past"}`}>
                    {trip.status === "upcoming" ? "Planned" : "Completed"}
                  </span>
                </div>
              </span>
              <b className="trip-card-arrow">
                <ChevronRightIcon />
              </b>
            </Link>
          ))}
        </div>
      ) : (
        <section className="trips-empty">
          <span className="empty-icon-wrap" aria-hidden="true">
            <TripsIcon />
          </span>
          <h1>No {tab === "upcoming" ? "upcoming" : "past"} trips</h1>
          <p>
            {tab === "upcoming"
              ? "Your saved visit preparation checklists will appear here."
              : "Completed visits will appear here when you mark a trip done."}
          </p>
          {tab === "upcoming" && (
            <Link className="mobile-primary-link" href="/plan">
              <span>Plan a new visit</span>
              <ArrowRightIcon />
            </Link>
          )}
        </section>
      )}

      <MobileNavigation active="trips" />
    </main>
  );
}
