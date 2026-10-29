"use client";

import Link from "next/link";
import { useState } from "react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { LocationsIcon, CheckIcon } from "@/components/icons";

export default function OnboardingPage() {
  const location = useUserLocation();
  const [asked, setAsked] = useState(false);
  const message = location.position
    ? "Approximate location is ready. It stays strictly in your browser and is not uploaded to any server."
    : location.status === "denied"
      ? "Location access was declined. You can still choose a Lagos area or use the demo location."
      : location.status === "error" || location.status === "unavailable"
        ? "Location is not available in this browser. You can choose a district manually."
        : "Allow location to sort verified service locations by distance. You can revoke this anytime.";

  function allowLocation() {
    setAsked(true);
    location.request();
  }

  return (
    <main className="mobile-app-shell onboarding-page">
      <div className="onboarding-top-row">
        <span className="onboarding-brand-tag">QueueLess</span>
        <Link href="/" className="onboarding-skip-link" aria-label="Skip onboarding">Skip</Link>
      </div>

      <div className="permission-art" aria-hidden="true">
        <div className="permission-circle-bg">
          <div className="permission-main-icon">
            <LocationsIcon />
          </div>
          <div className="permission-shield-badge">
            <CheckIcon />
          </div>
        </div>
      </div>

      <section className="onboarding-copy">
        <p className="mobile-eyebrow">Privacy-First Navigation</p>
        <h1>Find nearby Lagos service centres</h1>
        <p>Enable location access to calculate distance to the nearest Immigration (NIS) and FRSC offices.</p>
      </section>

      <div className="onboarding-privacy-box">
        <span className="privacy-lock-icon">🔒</span>
        <p className="onboarding-privacy">Your location stays in this browser. We never track your personal movement or share GPS data.</p>
      </div>

      {asked && <p className="onboarding-status-message" role="status">{message}</p>}

      <div className="onboarding-actions">
        <button
          className="mobile-primary-button"
          type="button"
          onClick={allowLocation}
          disabled={location.status === "loading"}
        >
          {location.status === "loading"
            ? "Requesting permission…"
            : location.position
              ? "Location access enabled ✓"
              : "Allow location access"}
        </button>
        <Link className="mobile-secondary-link" href="/">
          {location.position ? "Continue to home" : "Maybe later"}
        </Link>
      </div>
    </main>
  );
}
