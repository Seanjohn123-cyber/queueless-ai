"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { DesktopMapPane } from "./DesktopMapPane";

export function AppLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/" || pathname === "/showcase";

  if (isLanding) {
    return <div className="landing-layout-wrapper">{children}</div>;
  }

  return (
    <div className="flow-app-root">
      <div className="flow-dashboard-shell">
        {/* Left Dark Sidebar (Flow inspired) */}
        <DesktopSidebar />

        {/* Center Panel (Page Content) */}
        <div className="flow-center-panel" id="flow-content-pane">
          {children}
        </div>

        {/* Right Panel (Interactive Map, visible on Desktop) */}
        <DesktopMapPane />
      </div>
    </div>
  );
}
