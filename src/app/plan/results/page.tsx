"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileNavigation, MobileScreenHeader } from "@/components/MobileNavigation";
import { ALL_LOCATIONS } from "@/lib/locations";
import type { PlanResult } from "@/lib/plan-types";
import { saveTrip } from "@/lib/trips";
import {
  PassportIcon,
  DriverLicenceIcon,
  SparklesIcon,
  ChevronRightIcon,
  CheckIcon,
} from "@/components/icons";

const SERVICE_IDS: Record<string, string> = {
  ng_standard_passport_renewal: "passport",
  ng_national_drivers_licence_renewal: "drivers_licence",
};

export default function PlanResultsPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const checklistCount = useMemo(
    () => plan?.services.reduce((count, service) => count + service.checklist.length, 0) ?? 0,
    [plan]
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("queueless.pending-plan.v1");
      if (raw) setPlan(JSON.parse(raw) as PlanResult);
    } catch {
      setError("This saved plan could not be opened. Build a new plan to continue.");
    }
  }, []);

  function save() {
    if (!plan) return;
    try {
      const trip = saveTrip(plan);
      window.localStorage.removeItem("queueless.pending-plan.v1");
      setSaved(true);
      window.setTimeout(() => router.push(`/trips/${trip.id}`), 450);
    } catch {
      setError("Your browser could not save this visit plan. Check its local storage settings and try again.");
    }
  }

  if (!plan) {
    return (
      <main className="mobile-app-shell">
        <MobileScreenHeader title="Your Visit Plan" />
        <div className="mobile-empty-state">
          <span className="empty-icon-wrap" aria-hidden="true"><SparklesIcon /></span>
          <h1>{error || "No plan built yet"}</h1>
          <p>Describe your service task and we’ll build an official requirements checklist.</p>
          <Link className="mobile-primary-link" href="/plan">
            Start a new plan
          </Link>
        </div>
        <MobileNavigation active="plan" />
      </main>
    );
  }

  const recommendedLocations = [
    ...new Map(
      plan.services.flatMap((service) => {
        const kind = SERVICE_IDS[service.service_id];
        const location = ALL_LOCATIONS.find((item) => item.service === kind);
        return location ? [[location.id, location] as const] : [];
      })
    ).values(),
  ];

  return (
    <main className="mobile-app-shell plan-results-page">
      <MobileScreenHeader
        title="Your Visit Plan"
        action={
          <button className="header-save-button" type="button" onClick={save} disabled={saved}>
            {saved ? "Saved ✓" : "Save Plan"}
          </button>
        }
      />

      <section className="personalized-banner">
        <span className="banner-icon-circle" aria-hidden="true">
          <SparklesIcon />
        </span>
        <div>
          <strong>Customised Preparation Checklist</strong>
          <p>Generated based on official NIS and FRSC requirements for Lagos state.</p>
        </div>
      </section>

      <div className="results-summary-card">
        <span className="results-request-tag">Request summary</span>
        <p className="results-summary">{plan.request_summary}</p>
      </div>

      <div className={`result-wait-banner ${plan.queue_status.status === "estimated" ? "result-wait-estimated" : ""}`}>
        <div className="result-wait-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          {plan.queue_status.status === "estimated" ? (
            <>
              <strong>Estimated wait: {plan.queue_status.wait_minutes?.min}–{plan.queue_status.wait_minutes?.max} mins</strong>
              <p>{plan.queue_status.reason}</p>
              <small>Confidence: {((plan.queue_status.confidence ?? 0) * 100).toFixed(0)}% · Based on verified reports</small>
            </>
          ) : (
            <>
              <strong>Queue Wait: Unreported</strong>
              <p>{plan.queue_status.reason}</p>
            </>
          )}
        </div>
      </div>

      <section className="results-section" aria-labelledby="checklist-title">
        <div className="results-heading">
          <h2 id="checklist-title">1. Required Documents</h2>
          <span className="checklist-progress-pill">{checked.length} of {checklistCount} ready</span>
        </div>

        {plan.services.map((service) => {
          const isPassport = service.service_id === "ng_standard_passport_renewal";
          return (
            <article className="results-service-card" key={service.service_id}>
              <div className="service-card-header">
                <span className={`service-type-icon ${isPassport ? "icon-passport" : "icon-licence"}`}>
                  {isPassport ? <PassportIcon /> : <DriverLicenceIcon />}
                </span>
                <h3>{isPassport ? "Passport Requirements" : "Driver’s Licence Requirements"}</h3>
              </div>

              {service.checklist.length ? (
                <ul className="results-checklist">
                  {service.checklist.map((item) => {
                    const isDone = checked.includes(item.item_id);
                    return (
                      <li key={item.item_id}>
                        <label className={`results-checkbox-label ${isDone ? "is-checked" : ""}`}>
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() =>
                              setChecked((current) =>
                                current.includes(item.item_id)
                                  ? current.filter((val) => val !== item.item_id)
                                  : [...current, item.item_id]
                              )
                            }
                          />
                          <span className="custom-checkbox">{isDone && <CheckIcon />}</span>
                          <span className="checkbox-text">{item.label}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No checklist items stated in official sources reviewed. Refer to links below.</p>
              )}

              <div className="fee-callout">
                <span className="fee-icon">₦</span>
                <p className="results-fee-note">{service.fee_note}</p>
              </div>

              <details className="requirements-details">
                <summary>Official Steps &amp; Eligibility Guidelines</summary>
                <ul>
                  {service.steps.map((step, index) => (
                    <li key={`${index}-${step}`}>{step}</li>
                  ))}
                </ul>
                {service.eligibility.map((item) => (
                  <p key={item} className="eligibility-text">{item}</p>
                ))}
              </details>
            </article>
          );
        })}
      </section>

      <section className="results-section">
        <div className="results-heading">
          <h2>2. Locations to Confirm</h2>
          <Link href="/locations" className="section-header-link">Browse all</Link>
        </div>
        <p className="section-explainer">Recommended government centres in Lagos. Confirm opening hours before your trip.</p>

        {recommendedLocations.length ? (
          <div className="location-cards-stack">
            {recommendedLocations.map((location) => {
              const isPassport = location.service === "passport";
              return (
                <Link className="results-location-card" href={`/location/${location.id}`} key={location.id}>
                  <span className={`results-location-icon ${isPassport ? "icon-passport" : "icon-licence"}`}>
                    {isPassport ? <PassportIcon /> : <DriverLicenceIcon />}
                  </span>
                  <span className="results-location-info">
                    <strong>{location.name}</strong>
                    <small>{location.area} · {location.status === "unverified" ? "Community report" : "Verified"}</small>
                    <em>Confirm hours before travel</em>
                  </span>
                  <b className="results-chevron"><ChevronRightIcon /></b>
                </Link>
              );
            })}
          </div>
        ) : (
          <p>No matching locations listed in this pilot.</p>
        )}
      </section>

      <section className="results-section order-section">
        <h2>3. Recommended Order</h2>
        <p className="order-note">{plan.order_basis}</p>
        <ol className="stops-timeline">
          {plan.stops.map((stop) => (
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
        <h2>Official Verification Sources</h2>
        <div className="results-sources">
          {plan.sources.map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.source_id}>
              <span>{source.title}</span>
              <small>Checked {source.checked_on} ↗</small>
            </a>
          ))}
        </div>
      </section>

      {error && <p className="mobile-error" role="alert">{error}</p>}

      <button className="mobile-primary-button results-save" type="button" onClick={save} disabled={saved}>
        {saved ? "Saved to My Trips ✓" : "Save Plan to My Trips"}
      </button>

      <Link className="mobile-secondary-link" href="/report">
        Report an office wait
      </Link>

      <MobileNavigation active="plan" />
    </main>
  );
}
