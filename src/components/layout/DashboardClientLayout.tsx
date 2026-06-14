"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import gsap from "gsap";
import { Sidebar } from "./Sidebar";
import { BottomDock } from "./BottomDock";
import { SidebarContext } from "@/contexts/SidebarContext";

const BOOT_KEY = "sp-booted";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// First-load boot veil: serif wordmark slides away once per session.
// Unmounts via React state — never removes its own DOM node manually.
function BootVeil() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(BOOT_KEY) === "1";
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {}
    if (seen || prefersReducedMotion()) {
      setDone(true);
      return;
    }
    let cancelled = false;
    let tween: gsap.core.Tween | null = null;
    const out = () => {
      if (cancelled) return;
      tween = gsap.to(node, {
        yPercent: -100,
        duration: 0.7,
        ease: "expo.inOut",
        delay: 0.15,
        onComplete: () => setDone(true),
      });
    };
    if (document.fonts?.ready) {
      Promise.race([
        document.fonts.ready,
        new Promise((r) => setTimeout(r, 1200)),
      ]).then(out);
    } else {
      out();
    }
    // hard fallback: never leave the veil up more than 3s
    const t = setTimeout(() => setDone(true), 3000);
    return () => {
      cancelled = true;
      tween?.kill();
      clearTimeout(t);
    };
  }, []);

  if (done) return null;
  return (
    <div ref={ref} className="v2-boot">
      Social<em>plus</em>
    </div>
  );
}

// Floating theme toggle (bottom-right; sits above the tab bar on mobile)
function ThemeFab() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="v2-fab">
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        title="Toggle theme"
        aria-label="Toggle theme"
      >
        {mounted && resolvedTheme === "dark" ? (
          <Sun style={{ width: 16, height: 16 }} />
        ) : (
          <Moon style={{ width: 16, height: 16 }} />
        )}
      </button>
    </div>
  );
}

export function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  // Screen-enter micro-animation: stagger the new screen's sections in.
  // Guarded so an interrupted/errored tween can never leave content at opacity:0.
  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main || prefersReducedMotion()) return;
    // pages render one wrapper element; animate its sections
    const wrapper = main.children.length === 1 ? main.firstElementChild : main;
    if (!wrapper) return;
    const kids = Array.from(wrapper.children).slice(0, 8) as HTMLElement[];
    if (!kids.length) return;

    let tween: gsap.core.Tween | null = null;
    try {
      tween = gsap.fromTo(
        kids,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.06,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    } catch {
      // gsap unavailable for any reason — leave content fully visible
      kids.forEach((k) => {
        k.style.opacity = "";
        k.style.transform = "";
      });
    }
    return () => {
      tween?.kill();
      // ensure nothing is left mid-fade after an interrupt
      kids.forEach((k) => {
        k.style.opacity = "";
        k.style.transform = "";
      });
    };
  }, [pathname]);

  return (
    <SidebarContext.Provider value={{ setMobileOpen: () => {} }}>
      <div
        className="sp-frame-grain"
        style={{
          display: "flex",
          minHeight: "100vh",
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
            ref={mainRef}
            className="lg:pb-0 pb-16"
            style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
          >
            {children}
          </main>
        </div>

        {/* Bottom dock — mobile/tablet only */}
        <BottomDock />

        <ThemeFab />
        <BootVeil />
      </div>
    </SidebarContext.Provider>
  );
}
