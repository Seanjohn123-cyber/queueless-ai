"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PlanIcon,
  LocationsIcon,
  TripsIcon,
  BellIcon,
  SparklesIcon,
} from "./icons";

const navItems = [
  { label: "Home", href: "/app", icon: HomeIcon },
  { label: "Plan Visit", href: "/plan", icon: PlanIcon },
  { label: "Offices & Map", href: "/locations", icon: LocationsIcon },
  { label: "My Trips", href: "/trips", icon: TripsIcon },
  { label: "Report Wait", href: "/report", icon: SparklesIcon },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flow-desktop-sidebar" aria-label="Main Navigation">
      <div className="flow-brand-row">
        <Link href="/" className="flow-brand-link">
          <span className="flow-brand-logo">Q</span>
          <span className="flow-brand-name">
            QueueLess<span className="flow-brand-dot">.</span>
          </span>
        </Link>
      </div>

      <nav className="flow-nav-menu" aria-label="Desktop menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flow-nav-item ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="flow-nav-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="flow-nav-label">{item.label}</span>
              {isActive && <span className="flow-nav-active-indicator" />}
            </Link>
          );
        })}
      </nav>

      <div className="flow-sidebar-footer">
        <Link href="/profile" className="flow-user-profile-card">
          <div className="flow-avatar">
            <span>G</span>
            <span className="flow-online-dot" />
          </div>
          <div className="flow-user-meta">
            <strong>Guest User</strong>
            <small>Lagos Pilot</small>
          </div>
          <span className="flow-settings-icon" aria-hidden="true">⚙</span>
        </Link>
      </div>
    </aside>
  );
}
