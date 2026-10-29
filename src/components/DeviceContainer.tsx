"use client";

import { useEffect, useState, type ReactNode } from "react";

export function DeviceContainer({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"standard" | "expanded">("standard");
  const [time, setTime] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`device-viewport-root ${mode === "expanded" ? "view-expanded" : "view-standard"}`}>
      {/* Desktop Toolbar */}
      <aside className="device-control-bar" aria-label="Device Preview Controls">
        <div className="control-brand">
          <span className="control-brand-dot" aria-hidden="true" />
          <strong>QueueLess AI</strong>
          <span className="control-tag">Mobile Pilot</span>
        </div>

        <div className="control-switcher" role="radiogroup" aria-label="Device Viewport">
          <button
            type="button"
            className={`control-pill ${mode === "standard" ? "is-active" : ""}`}
            onClick={() => setMode("standard")}
            aria-checked={mode === "standard"}
            role="radio"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="14" height="20" x="5" y="2" rx="3" />
              <path d="M12 18h.01" />
            </svg>
            Standard Mobile App (390×844)
          </button>
          <button
            type="button"
            className={`control-pill ${mode === "expanded" ? "is-active" : ""}`}
            onClick={() => setMode("expanded")}
            aria-checked={mode === "expanded"}
            role="radio"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
            Full Width View
          </button>
        </div>

        <div className="control-meta">
          <span className="spec-badge">
            {mode === "standard" ? "iPhone Standard: 393 × 852 px" : "Fluid Screen Width"}
          </span>
        </div>
      </aside>

      {/* Main Device Showcase Frame */}
      <div className="device-outer-frame">
        <div className="device-hardware">
          {/* Dynamic Island */}
          <div className="device-notch" aria-hidden="true">
            <span className="device-camera-lens" />
            <span className="device-sensor-dot" />
          </div>

          {/* iOS Status Bar */}
          <div className="device-status-bar" aria-hidden="true">
            <span className="status-clock">{time}</span>
            <div className="status-indicators">
              {/* Cellular 4-bar SVG */}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <rect x="2" y="15" width="3" height="7" rx="1" />
                <rect x="7.5" y="11" width="3" height="11" rx="1" />
                <rect x="13" y="6" width="3" height="16" rx="1" />
                <rect x="18.5" y="2" width="3" height="20" rx="1" />
              </svg>
              {/* Wi-Fi SVG */}
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
              </svg>
              {/* Battery SVG (100% full green/dark) */}
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="6" width="16" height="12" rx="3" />
                <rect x="4" y="8" width="12" height="8" rx="1.5" fill="currentColor" stroke="none" />
                <path d="M20 10v4" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Internal App Canvas */}
          <div className="device-screen-canvas" id="app-canvas">
            {children}
          </div>

          {/* Home Indicator */}
          <div className="device-home-bar" aria-hidden="true">
            <span className="device-indicator-pill" />
          </div>
        </div>
      </div>
    </div>
  );
}
