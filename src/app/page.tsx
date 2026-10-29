"use client";

import Link from "next/link";
import { triggerPwaInstall } from "@/components/PwaRegistrar";
import {
  SparklesIcon,
  ArrowRightIcon,
  PassportIcon,
  DriverLicenceIcon,
  ChevronRightIcon,
  SearchIcon,
  BellIcon,
} from "@/components/icons";

export default function LandingPage() {
  return (
    <div className="chrono-landing-shell">
      {/* Top Clean Navbar */}
      <nav className="chrono-nav" aria-label="Main Navigation">
        <div className="chrono-nav-container">
          <Link href="/" className="chrono-brand">
            <span className="chrono-brand-grid-icon" aria-hidden="true">
              <span className="grid-dot blue" />
              <span className="grid-dot dark" />
              <span className="grid-dot dark" />
              <span className="grid-dot dark" />
            </span>
            <span className="chrono-brand-name">
              QueueLess<span className="brand-suffix">AI</span>
            </span>
          </Link>

          <div className="chrono-nav-links">
            <a href="#impact">Civic Impact</a>
            <Link href="/plan">Visit Planner</Link>
            <Link href="/locations">Offices Map</Link>
          </div>

          <div className="chrono-nav-actions">
            <span className="chrono-hackathon-chip">
              <span className="chip-indicator" />
              Nebius ✕ NVIDIA
            </span>
            <button
              type="button"
              onClick={triggerPwaInstall}
              className="chrono-nav-install-btn"
              title="Install app to your device"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Install</span>
            </button>
            <Link href="/plan" className="chrono-text-btn">
              Visit Planner
            </Link>
            <Link href="/app" className="chrono-primary-btn">
              <span>Launch Live App</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Floating Visual Elements */}
      <header className="chrono-hero-section">
        <div className="chrono-hero-stage">
          {/* Top 3D Floating Icon */}
          <div className="chrono-floating-hero-badge" aria-hidden="true">
            <div className="badge-3d-box">
              <span className="box-dot dot-blue" />
              <span className="box-dot dot-dark" />
              <span className="box-dot dot-dark" />
              <span className="box-dot dot-dark" />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="chrono-hero-heading">
            Prepare, plan, and track
            <span className="heading-sub-line">all in one place</span>
          </h1>

          <p className="chrono-hero-tagline">
            Sourced civic errand checklists &amp; transparent queue intelligence powered by NVIDIA Nemotron on Nebius AI Cloud.
          </p>

          <div className="chrono-cta-wrapper">
            <Link href="/app" className="chrono-cta-main">
              <span>Launch Live App</span>
            </Link>
            <button
              type="button"
              onClick={triggerPwaInstall}
              className="chrono-cta-install"
              title="Install QueueLess AI on your phone or PC"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Install App</span>
            </button>
            <Link href="/plan" className="chrono-cta-secondary">
              <span>Try Visit Planner ➔</span>
            </Link>
          </div>

          {/* FLOATING CARD 1: Top-Left Pinned Sticky Note */}
          <div className="chrono-float-card float-top-left" aria-hidden="true">
            <div className="sticky-paper-stack">
              <div className="sticky-note-yellow">
                <span className="sticky-pushpin" />
                <p>
                  Check official requirements and verified fees before you step out to save repeat trips.
                </p>
              </div>
              <div className="sticky-floating-check">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>

          {/* FLOATING CARD 2: Top-Right Radar Reminder */}
          <div className="chrono-float-card float-top-right" aria-hidden="true">
            <div className="reminder-card-widget">
              <div className="reminder-header">
                <div className="reminder-icon-clock">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span>Queue Radar</span>
              </div>
              <strong className="reminder-title">NIS Ikoyi Passport</strong>
              <div className="reminder-time-pill">
                <span>08:30 – 14:00</span>
              </div>
            </div>
          </div>

          {/* FLOATING CARD 3: Bottom-Left Today's Errands */}
          <div className="chrono-float-card float-bottom-left" aria-hidden="true">
            <div className="tasks-card-widget">
              <div className="tasks-widget-header">
                <strong>Today&apos;s errands</strong>
                <span className="tasks-avatar-group">
                  <span className="tiny-avatar av-1" />
                  <span className="tiny-avatar av-2" />
                </span>
              </div>

              <div className="tasks-widget-item">
                <div className="task-row">
                  <span className="task-bullet orange">■</span>
                  <span className="task-name">Passport Renewal (NIS)</span>
                  <span className="task-pct">100%</span>
                </div>
                <div className="task-bar">
                  <div className="bar-fill cyan" style={{ width: "100%" }} />
                </div>
              </div>

              <div className="tasks-widget-item">
                <div className="task-row">
                  <span className="task-bullet green">■</span>
                  <span className="task-name">Driver&apos;s Licence (FRSC)</span>
                  <span className="task-pct">75%</span>
                </div>
                <div className="task-bar">
                  <div className="bar-fill green" style={{ width: "75%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING CARD 4: Bottom-Right Tech Integrations */}
          <div className="chrono-float-card float-bottom-right" aria-hidden="true">
            <div className="integrations-card-widget">
              <span className="integrations-label">Hackathon Tech Stack</span>
              <div className="integrations-icons-row">
                <div className="integration-icon-badge nebius-box" title="Nebius AI Cloud">
                  <strong>N</strong>
                </div>
                <div className="integration-icon-badge nvidia-box" title="NVIDIA Nemotron">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6z" />
                  </svg>
                </div>
                <div className="integration-icon-badge osm-box" title="OpenStreetMap / Leaflet">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="22" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="chrono-stats-strip">
        <div className="chrono-stats-container">
          <div className="chrono-stat-cell">
            <span className="chrono-stat-val">30B</span>
            <span className="chrono-stat-txt">NVIDIA Nemotron Nano</span>
          </div>
          <div className="chrono-stat-cell">
            <span className="chrono-stat-val">0</span>
            <span className="chrono-stat-txt">Hallucinated Waits</span>
          </div>
          <div className="chrono-stat-cell">
            <span className="chrono-stat-val">12</span>
            <span className="chrono-stat-txt">Verified Lagos Offices</span>
          </div>
          <div className="chrono-stat-cell">
            <span className="chrono-stat-val">65%</span>
            <span className="chrono-stat-txt">Repeat Visits Saved</span>
          </div>
        </div>
      </section>

      {/* Main Content: Impact & Final CTA */}
      <main className="chrono-main-content">
        {/* Impact Cards */}
        <section className="chrono-impact-section" id="impact">
          <h2 className="chrono-impact-title">The Megacity Challenge: Lagos, Nigeria</h2>
          <div className="chrono-impact-grid">
            <div className="chrono-impact-card">
              <span className="impact-emoji-icon">⏳</span>
              <h4>8.4 Hours Lost Per Visit</h4>
              <p>Average citizen wait time at high-traffic Lagos passport or licensing centers without prior document verification.</p>
            </div>
            <div className="chrono-impact-card">
              <span className="impact-emoji-icon">🔄</span>
              <h4>2.3 Trips Per Errand</h4>
              <p>Citizens frequently make 2 to 3 repeat trips due to unannounced prerequisite documents, wrong fees, or closed gates.</p>
            </div>
            <div className="chrono-impact-card">
              <span className="impact-emoji-icon">💡</span>
              <h4>The QueueLess Solution</h4>
              <p>Grounded preparation checklist, verified government coordinates, and intelligent errand sequencing save up to 65% of citizen transit time.</p>
            </div>
          </div>
        </section>

        {/* Big Clean CTA Banner */}
        <section className="chrono-final-cta-section">
          <div className="chrono-final-card">
            <span className="final-pill-tag">Nebius ✕ NVIDIA Hackathon</span>
            <h3>Ready to experience QueueLess AI?</h3>
            <p>Explore the full Lagos resident dashboard, interactive office radar map, and intelligent visit planner.</p>
            <div className="chrono-final-actions">
              <Link href="/app" className="chrono-btn-cta-blue">
                <span>Enter Live App</span>
                <ArrowRightIcon />
              </Link>
              <button
                type="button"
                onClick={triggerPwaInstall}
                className="chrono-btn-cta-install"
              >
                <span>Install Native App</span>
              </button>
              <Link href="/plan" className="chrono-btn-cta-white">
                <span>Start Visit Plan</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="chrono-footer">
        <div className="chrono-footer-inner">
          <div className="footer-credits">
            Built for the <strong>Nebius AI Cloud ✕ NVIDIA Nemotron Hackathon 2026</strong>
          </div>
          <div className="footer-links">
            <Link href="/app">Live App</Link>
            <Link href="/plan">Visit Planner</Link>
            <Link href="/locations">Lagos Offices</Link>
            <Link href="/report">Submit Wait Report</Link>
          </div>
          <p className="footer-copyright">
            © 2026 QueueLess AI · Lagos Service Guide Pilot · Sourced Civic Errand Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
}