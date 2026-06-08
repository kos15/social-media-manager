"use client";

import { Sidebar } from "./Sidebar";
import { BottomDock } from "./BottomDock";
import { SidebarContext } from "@/contexts/SidebarContext";

export function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarContext.Provider value={{ setMobileOpen: () => {} }}>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--paper)",
          color: "var(--ink)",
        }}
      >
        {/* Desktop sidebar — hidden on mobile/tablet */}
        <Sidebar />

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <main
            className="lg:pb-0 pb-16"
            style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
          >
            {children}
          </main>
        </div>

        {/* Bottom dock — mobile/tablet only */}
        <BottomDock />
      </div>
    </SidebarContext.Provider>
  );
}
