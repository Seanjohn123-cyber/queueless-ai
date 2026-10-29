"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { MobileNavigation } from "@/components/MobileNavigation";
import { ALL_LOCATIONS } from "@/lib/locations";

const services = ["ng_standard_passport_renewal", "ng_national_drivers_licence_renewal"] as const;

export default function VisitReportPage() {
  const [serviceId, setServiceId] = useState<(typeof services)[number]>(services[0]);
  const [locationId, setLocationId] = useState("");
  const [arrival, setArrival] = useState("");
  const [minutes, setMinutes] = useState("");
  const [outcome, setOutcome] = useState<"completed" | "return_required">("completed");
  const [missingItems, setMissingItems] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const requestedService = new URLSearchParams(window.location.search).get("service");
    if (requestedService && services.includes(requestedService as (typeof services)[number])) setServiceId(requestedService as (typeof services)[number]);
    const requestedLocation = new URLSearchParams(window.location.search).get("location");
    if (requestedLocation && ALL_LOCATIONS.some((location) => location.id === requestedLocation)) setLocationId(requestedLocation);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id: serviceId, location_id: locationId || null, arrived_at: new Date(arrival).toISOString(), wait_minutes: Number(minutes), outcome, missing_items: missingItems.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Report could not be saved.");
      const gateStatus = result.queue_status?.status === "estimated";
      setMessage(gateStatus
        ? "Thanks. Your report is saved and wait estimates for this service are now available."
        : "Thanks. Your report was saved. More similar reports are needed before a wait estimate can be shown.");
      setArrival("");
      setMinutes("");
      setMissingItems("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Report could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app-shell report-page">
      <section className="report-shell">
        <div className="report-heading">
          <Link className="report-back" href="/" aria-label="Back to locations">‹</Link>
          <div><p className="eyebrow">Lagos pilot</p><h1>How did the visit go?</h1></div>
        </div>
        <p className="report-intro">Share the actual wait and whether you completed the service. We don’t ask for identity details; please leave personal information out of the checklist note.</p>

        <form className="report-form" onSubmit={submit}>
          <label>Service visited
            <select value={serviceId} onChange={(event) => {
              const nextService = event.target.value as (typeof services)[number];
              setServiceId(nextService);
              const nextKind = nextService === services[0] ? "passport" : "drivers_licence";
              if (locationId && ALL_LOCATIONS.find((location) => location.id === locationId)?.service !== nextKind) setLocationId("");
            }}>
              <option value="ng_standard_passport_renewal">Standard passport renewal</option>
              <option value="ng_national_drivers_licence_renewal">Driver’s licence renewal</option>
            </select>
          </label>
          <label>Location visited (optional)
            <select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
              <option value="">Not listed or not sure</option>
              {ALL_LOCATIONS.filter((location) => location.service === (serviceId === services[0] ? "passport" : "drivers_licence")).map((location) => <option key={location.id} value={location.id}>{location.name} · {location.status.replaceAll("_", " ")}</option>)}
            </select>
          </label>
          <label>Arrival time
            <input required type="datetime-local" value={arrival} onChange={(event) => setArrival(event.target.value)} />
          </label>
          <label>Minutes you waited
            <input required type="number" inputMode="numeric" min="0" max="1440" value={minutes} onChange={(event) => setMinutes(event.target.value)} />
          </label>
          <label>Was anything missing from the checklist?
            <textarea maxLength={500} rows={2} value={missingItems} onChange={(event) => setMissingItems(event.target.value)} placeholder="Optional" />
          </label>
          <fieldset className="report-outcomes">
            <legend>Visit outcome</legend>
            <label className={`radio-option${outcome === "completed" ? " is-selected" : ""}`}><input type="radio" name="outcome" value="completed" checked={outcome === "completed"} onChange={() => setOutcome("completed")} /> Finished</label>
            <label className={`radio-option${outcome === "return_required" ? " is-selected" : ""}`}><input type="radio" name="outcome" value="return_required" checked={outcome === "return_required"} onChange={() => setOutcome("return_required")} /> Must come back</label>
          </fieldset>
          <p className="report-data-note">Wait estimates only appear once enough recent, trustworthy reports exist. Your report will not change the current wait status.</p>
          <button className="submit-report" disabled={saving || !arrival || minutes === ""}>{saving ? "Submitting…" : "Submit report"}</button>
          {message && <p className="report-message" role="status">{message}</p>}
        </form>
      </section>
      <footer className="site-footer report-footer">Reports are stored locally in this pilot · No personal identifiers are requested</footer>
      <MobileNavigation active="trips" />
    </main>
  );
}
