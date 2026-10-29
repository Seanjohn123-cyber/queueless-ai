import Link from "next/link";
import type { ReactNode } from "react";
import {
  HomeIcon,
  PlanIcon,
  LocationsIcon,
  TripsIcon,
  ChevronLeftIcon,
} from "./icons";

export type MobileTab = "home" | "plan" | "locations" | "trips";

const tabs: Array<{
  id: MobileTab;
  label: string;
  href: string;
  icon: (props: { className?: string }) => ReactNode;
}> = [
  { id: "home", label: "App", href: "/app", icon: HomeIcon },
  { id: "plan", label: "Plan", href: "/plan", icon: PlanIcon },
  { id: "locations", label: "Offices", href: "/locations", icon: LocationsIcon },
  { id: "trips", label: "My Trips", href: "/trips", icon: TripsIcon },
];

export function MobileNavigation({ active }: { active: MobileTab }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Main navigation">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        return (
          <Link
            href={tab.href}
            className={`nav-tab-item ${isActive ? "is-active" : ""}`}
            key={tab.id}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="nav-tab-icon-wrap" aria-hidden="true">
              <Icon className="nav-tab-icon" />
              {isActive && <span className="nav-tab-glow" />}
            </span>
            <span className="nav-tab-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileScreenHeader({
  title,
  backHref = "/",
  action,
}: {
  title: string;
  backHref?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mobile-screen-header">
      <Link href={backHref} className="mobile-back" aria-label="Go back">
        <ChevronLeftIcon />
      </Link>
      <strong className="mobile-screen-title">{title}</strong>
      <span className="mobile-header-action">{action}</span>
    </header>
  );
}
