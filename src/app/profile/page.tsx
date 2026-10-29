"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileNavigation, MobileScreenHeader } from "@/components/MobileNavigation";
import {
  TripsIcon,
  LocationsIcon,
  BellIcon,
  ChevronRightIcon,
  InfoIcon,
} from "@/components/icons";

export default function ProfilePage() {
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    setNotifications(window.localStorage.getItem("queueless.notifications") === "on");
  }, []);

  function toggleNotifications() {
    setNotifications((current) => {
      const next = !current;
      window.localStorage.setItem("queueless.notifications", next ? "on" : "off");
      return next;
    });
  }

  return (
    <main className="mobile-app-shell profile-page">
      <MobileScreenHeader title="Account &amp; Settings" />

      <section className="profile-identity">
        <span className="profile-avatar-circle">G</span>
        <div className="profile-user-info">
          <strong>Guest User</strong>
          <small>Lagos Pilot · Saved locally on this device</small>
        </div>
      </section>

      <section className="profile-menu" aria-label="Profile settings">
        <Link href="/trips" className="profile-menu-item">
          <span className="menu-icon-wrap"><TripsIcon /></span>
          <span className="menu-text">My Planned Trips</span>
          <b className="menu-chevron"><ChevronRightIcon /></b>
        </Link>
        <Link href="/locations/saved" className="profile-menu-item">
          <span className="menu-icon-wrap"><LocationsIcon /></span>
          <span className="menu-text">Saved Offices</span>
          <b className="menu-chevron"><ChevronRightIcon /></b>
        </Link>
        <Link href="/onboarding" className="profile-menu-item">
          <span className="menu-icon-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="21.17" x2="12" y1="8" y2="8" />
              <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
              <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
            </svg>
          </span>
          <span className="menu-text">GPS Location Access</span>
          <b className="menu-chevron"><ChevronRightIcon /></b>
        </Link>
        <button type="button" onClick={toggleNotifications} className="profile-menu-item">
          <span className="menu-icon-wrap"><BellIcon /></span>
          <span className="menu-text">Queue Alerts</span>
          <div className="toggle-with-label">
            <small>{notifications ? "Active" : "Off"}</small>
            <i className={`settings-toggle ${notifications ? "is-on" : ""}`} />
          </div>
        </button>
        <Link href="/support" className="profile-menu-item">
          <span className="menu-icon-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" x2="12.01" y1="17" y2="17" strokeWidth="3" />
            </svg>
          </span>
          <span className="menu-text">Help &amp; FAQ</span>
          <b className="menu-chevron"><ChevronRightIcon /></b>
        </Link>
        <Link href="/about" className="profile-menu-item">
          <span className="menu-icon-wrap"><InfoIcon /></span>
          <span className="menu-text">About QueueLess Pilot</span>
          <b className="menu-chevron"><ChevronRightIcon /></b>
        </Link>
      </section>

      <div className="profile-privacy-box">
        <p className="profile-data-note">
          🔒 Privacy Notice: QueueLess runs client-side in your browser for this pilot. All checklists, notes, and preferences stay on your device and are never sold or tracked across sites.
        </p>
      </div>

      <MobileNavigation active="home" />
    </main>
  );
}
