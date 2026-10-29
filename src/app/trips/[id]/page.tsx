"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileNavigation, MobileScreenHeader } from "@/components/MobileNavigation";
import type { SavedTrip } from "@/lib/plan-types";
import { deleteTrip, readTrips, updateTripStatus } from "@/lib/trips";
import { TripsIcon, CheckIcon, ChevronRightIcon } from "@/components/icons";

export default function TripDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<SavedTrip | null>(null);

  useEffect(() => {
    setTrip(readTrips().find((item) => item.id === params.id) ?? null);
  }, [params.id]);

  if (!trip) {
    return (
      <main className="mobile-app-shell">
        <MobileScreenHeader title="Trip Details" backHref="/trips" />
        <div className="mobile-empty-state">
          <span className="empty-icon-wrap" aria-hidden="true"><TripsIcon /></span>
          <h1>Trip not found</h1>
          <p>This visit plan may have been removed or cleared from local storage.</p>
          <Link className="mobile-primary-link" href="/trips">Back to My Trips</Link>
        </div>
        <MobileNavigation active="trips" />
      </main>
    );
  }

  function markVisited() {
    updateTripStatus(trip!.id, "past");
    setTrip({ ...trip!, status: "past" });
  }

  function remove() {
    deleteTrip(trip!.id);
    router.push("/trips");
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: "My QueueLess visit plan", text: trip!.plan.request_summary, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Trip link copied to clipboard!");
    }
  }

  return (
    <main className="mobile-app-shell trip-details-page">
      <MobileScreenHeader title="Trip Details" backHref="/trips" />

      <section className="trip-summary-card">
        <div>
          <strong>{trip.plan.request_summary}</strong>
          <small>{new Date(trip.createdAt).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</small>
          <span className={`trip-status-pill ${trip.status === "past" ? "status-past" : "status-upcoming"}`}>
            {trip.status === "past" ? "Visited ✓" : "Planned"}
          </span>
        </div>
        <p>Official preparation guidelines · Confirm appointment directly with agency portal before travelling.</p>
      </section>

      <section className="results-section">
        <h2>Itinerary Schedule</h2>
        <ol className="stops-timeline">
          {trip.plan.stops.map((stop) => (
            <li key={stop.service_id}>
              <b className="stop-number">{stop.order}</b>
              <span className="stop-details">
                <strong>{stop.service_id === "ng_standard_passport_renewal" ? "Passport Office" : "Driver’s Licence Centre"}</strong>
                <small>{stop.reason}</small>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="results-section">
        <h2>Document Checklist</h2>
        {trip.plan.services.map((service) => (
          <div className="trip-checklist" key={service.service_id}>
            <h3>{service.service_id === "ng_standard_passport_renewal" ? "Passport Application" : "Driver’s Licence Renewal"}</h3>
            {service.checklist.length ? (
              <ul className="results-checklist">
                {service.checklist.map((item) => (
                  <li key={item.item_id} className="checklist-item-static">
                    <span className="check-bullet">✓</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No specific documents noted in reviewed official requirements.</p>
            )}
          </div>
        ))}
      </section>

      <section className="trip-actions">
        <button type="button" onClick={markVisited} disabled={trip.status === "past"} className="trip-complete-btn">
          {trip.status === "past" ? "Visit marked complete ✓" : "Mark visit complete"}
        </button>
        <button type="button" onClick={() => void share()} className="trip-share-btn">
          Share plan
        </button>
        <button type="button" className="trip-delete-button" onClick={remove}>
          Delete plan
        </button>
      </section>

      <Link className="mobile-secondary-link" href={`/report?service=${encodeURIComponent(trip.plan.services[0]?.service_id ?? "ng_standard_passport_renewal")}`}>
        Report how the visit went ↗
      </Link>
      <MobileNavigation active="trips" />
    </main>
  );
}
