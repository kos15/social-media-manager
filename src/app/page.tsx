"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import * as THREE from "three";
import "./landing-v2.css";

// ── Typewriter hook ──
function useTypewriter(phrases: string[], trigger: boolean) {
  const [text, setText] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!trigger) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(phrases.join(""));
      return;
    }
    let pi = 0,
      ci = 0;
    let current = "";
    function tick() {
      if (pi >= phrases.length) return;
      const phrase = phrases[pi];
      if (ci < phrase.length) {
        current += phrase[ci++];
        setText(current);
        timerRef.current = setTimeout(tick, 18 + Math.random() * 24);
      } else {
        pi++;
        ci = 0;
        timerRef.current = setTimeout(tick, 360);
      }
    }
    tick();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return text;
}

// ── Split text helper (wraps words, keeps <em>/<br>/<span>) ──
function splitWords(el: HTMLElement | null) {
  if (!el) return [];
  if (el.querySelector(".w"))
    return Array.from(el.querySelectorAll<HTMLElement>(".w"));
  function walk(node: Node) {
    const children = Array.from(node.childNodes);
    children.forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        const parts = (child.textContent || "").split(/(\s+)/);
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) {
            frag.appendChild(document.createTextNode(" "));
          } else {
            const w = document.createElement("span");
            w.className = "w";
            w.textContent = p;
            frag.appendChild(w);
          }
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1 && (child as Element).tagName !== "BR") {
        walk(child);
      }
    });
  }
  walk(el);
  return Array.from(el.querySelectorAll<HTMLElement>(".w"));
}

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const particleMatRef = useRef<THREE.PointsMaterial | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [typeTrigger, setTypeTrigger] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const typedText = useTypewriter(
    [
      "We rebuilt our scheduling engine from scratch. ",
      "Posts now publish in under 200ms across all four platforms — ",
      "even on flaky mobile.",
    ],
    typeTrigger,
  );

  // Particle color tracks theme
  useEffect(() => {
    particleMatRef.current?.color.setHex(
      resolvedTheme === "dark" ? 0x6a6a6a : 0xa89e8e,
    );
  }, [resolvedTheme]);

  // ── Interaction engine: GSAP + ScrollTrigger + Lenis + Three.js ──
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const cleanupFns: Array<() => void> = [];

    gsap.registerPlugin(ScrollTrigger);

    // Lenis smooth scroll
    let lenis: Lenis | null = null;
    let lenisTick: ((t: number) => void) | null = null;
    if (!prefersReduced) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      lenisTick = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(lenisTick);
      gsap.ticker.lagSmoothing(0);
      lenisRef.current = lenis;
    }

    const ctx = gsap.context(() => {
      // Nav: scrolled state + progress bar
      const nav = root.querySelector(".nav");
      ScrollTrigger.create({
        start: 10,
        end: "max",
        onUpdate: (self) =>
          nav?.classList.toggle("scrolled", self.scroll() > 10),
        onToggle: (self) =>
          nav?.classList.toggle("scrolled", self.scroll() > 10),
      });
      gsap.to(".nav-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: 0,
          end: "max",
          scrub: 0.3,
        },
      });

      // Preloader + hero intro
      const pre = root.querySelector(".preloader");
      const heroWords = splitWords(root.querySelector<HTMLElement>("#heroH1"));
      const introTargets = [
        ".hero-tag",
        ".hero-sub",
        ".hero-cta",
        ".hero-meta",
      ];

      if (prefersReduced) {
        if (pre) gsap.set(pre, { display: "none" });
      } else {
        gsap.set(heroWords, { yPercent: 60, opacity: 0, rotateZ: 1.2 });
        gsap.set(introTargets, { y: 26, opacity: 0 });
        gsap.set(".hero-mock-wrap", { y: 60, opacity: 0 });

        const tl = gsap.timeline();
        tl.to(
          ".pre-brand",
          { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
          0.05,
        )
          .to(
            ".pre-line span",
            { scaleX: 1, duration: 0.7, ease: "power2.inOut" },
            0.2,
          )
          .to(pre, {
            yPercent: -100,
            duration: 0.8,
            ease: "expo.inOut",
            delay: 0.1,
            onComplete: () => {
              if (pre) gsap.set(pre, { display: "none" });
            },
          })
          .to(
            heroWords,
            {
              yPercent: 0,
              opacity: 1,
              rotateZ: 0,
              duration: 1.1,
              stagger: 0.045,
              ease: "power4.out",
            },
            "-=0.35",
          )
          .to(
            introTargets,
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              stagger: 0.09,
              ease: "power3.out",
            },
            "-=0.8",
          )
          .to(
            ".hero-mock-wrap",
            { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" },
            "-=0.7",
          );
      }

      // Scroll reveals
      if (!prefersReduced) {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });
        gsap.utils
          .toArray<HTMLElement>("[data-reveal-group]")
          .forEach((group) => {
            gsap.from(group.children, {
              y: 36,
              opacity: 0,
              duration: 0.9,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: { trigger: group, start: "top 86%" },
            });
          });

        // parallax elements (ghost numerals)
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amt = parseFloat(el.getAttribute("data-parallax") || "0.1");
          gsap.fromTo(
            el,
            { y: amt * 140 },
            {
              y: amt * -140,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        });

        // hero mock: settle from slight 3D pitch as you scroll
        gsap.fromTo(
          ".hero-mock",
          { rotateX: 9, scale: 0.965 },
          {
            rotateX: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero-mock-wrap",
              start: "top 95%",
              end: "top 35%",
              scrub: 0.5,
            },
          },
        );

        // workflow line draw
        gsap.to(".steps-line span", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".steps",
            start: "top 85%",
            end: "bottom 60%",
            scrub: 0.5,
          },
        });

        // CTA headline split
        const ctaWords = splitWords(root.querySelector<HTMLElement>("#ctaH2"));
        gsap.set(ctaWords, { yPercent: 50, opacity: 0 });
        gsap.to(ctaWords, {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.04,
          ease: "power4.out",
          scrollTrigger: { trigger: "#cta", start: "top 75%" },
        });
      }

      // Analytics chart draw trigger
      const an = root.querySelector(".mk-an");
      if (an) {
        ScrollTrigger.create({
          trigger: an,
          start: "top 80%",
          onEnter: () => an.classList.add("drawn"),
        });
      }

      // Counters
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = parseFloat(el.getAttribute("data-count") || "0");
        const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
        const comma = el.getAttribute("data-comma") === "1";
        const fmt = (v: number) => {
          let s = v.toFixed(decimals);
          if (comma) s = Number(s).toLocaleString("en-US");
          return s;
        };
        if (prefersReduced) {
          el.textContent = fmt(target);
          return;
        }
        const obj = { v: 0 };
        el.textContent = fmt(0);
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
          onUpdate: () => {
            el.textContent = fmt(obj.v);
          },
        });
      });

      // Hero typewriter trigger
      ScrollTrigger.create({
        trigger: ".hero-mock",
        start: "top 80%",
        once: true,
        onEnter: () => setTypeTrigger(true),
      });

      // 3D tilt on mocks + magnetic buttons + custom cursor (desktop only)
      if (finePointer && !prefersReduced) {
        root.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
          const strength = parseFloat(el.getAttribute("data-tilt") || "4");
          const qx = gsap.quickTo(el, "rotationY", {
            duration: 0.6,
            ease: "power3.out",
          });
          const qy = gsap.quickTo(el, "rotationX", {
            duration: 0.6,
            ease: "power3.out",
          });
          el.addEventListener("mousemove", (e) => {
            const r = el.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            qx(nx * strength);
            qy(-ny * strength);
          });
          el.addEventListener("mouseleave", () => {
            qx(0);
            qy(0);
          });
        });

        root.querySelectorAll<HTMLElement>("[data-magnet]").forEach((el) => {
          const qx = gsap.quickTo(el, "x", {
            duration: 0.5,
            ease: "power3.out",
          });
          const qy = gsap.quickTo(el, "y", {
            duration: 0.5,
            ease: "power3.out",
          });
          el.addEventListener("mousemove", (e) => {
            const r = el.getBoundingClientRect();
            qx((e.clientX - (r.left + r.width / 2)) * 0.22);
            qy((e.clientY - (r.top + r.height / 2)) * 0.22);
          });
          el.addEventListener("mouseleave", () => {
            qx(0);
            qy(0);
          });
        });

        const dot = root.querySelector<HTMLElement>(".cursor-dot");
        const ring = root.querySelector<HTMLElement>(".cursor-ring");
        if (dot && ring) {
          root.classList.add("has-cursor");
          let mx = window.innerWidth / 2,
            my = window.innerHeight / 2,
            rx = mx,
            ry = my;
          const onMove = (e: MouseEvent) => {
            mx = e.clientX;
            my = e.clientY;
          };
          window.addEventListener("mousemove", onMove, { passive: true });
          const cursorTick = () => {
            rx += (mx - rx) * 0.18;
            ry += (my - ry) * 0.18;
            dot.style.transform = `translate(${mx}px,${my}px)`;
            ring.style.transform =
              `translate(${rx}px,${ry}px)` +
              (ring.classList.contains("is-hover") ? " scale(1.6)" : "");
          };
          gsap.ticker.add(cursorTick);
          const onOver = (e: Event) => {
            const t = (e.target as Element).closest("a, button, [data-cursor]");
            ring.classList.toggle("is-hover", !!t);
          };
          document.addEventListener("mouseover", onOver);
          cleanupFns.push(() => {
            window.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseover", onOver);
            gsap.ticker.remove(cursorTick);
          });
        }
      }
    }, root);

    // ── Three.js particle field in hero ──
    (function initThree() {
      const canvas = root.querySelector<HTMLCanvasElement>("#heroCanvas");
      const hero = root.querySelector<HTMLElement>(".hero");
      if (!canvas || !hero) return;
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
        });
      } catch {
        return;
      }

      const isSmall = window.innerWidth < 900;
      const COLS = isSmall ? 60 : 110;
      const ROWS = isSmall ? 34 : 56;
      const SPACE = 1.0;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 400);
      camera.position.set(0, 9, 26);
      camera.lookAt(0, 0, 0);

      const count = COLS * ROWS;
      const positions = new Float32Array(count * 3);
      let i = 0;
      for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
          positions[i * 3] = (x - COLS / 2) * SPACE;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = (y - ROWS / 2) * SPACE;
          i++;
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const dark = document.documentElement.classList.contains("dark");
      const mat = new THREE.PointsMaterial({
        color: dark ? 0x6a6a6a : 0xa89e8e,
        size: 0.075,
        transparent: true,
        opacity: 0.65,
        sizeAttenuation: true,
        depthWrite: false,
      });
      particleMatRef.current = mat;
      const points = new THREE.Points(geo, mat);
      points.rotation.x = -0.08;
      scene.add(points);

      const resize = () => {
        const w = hero.clientWidth,
          h = hero.clientHeight;
        renderer.setSize(w, h, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      let mouseX = 0,
        mouseY = 0,
        targX = 0,
        targY = 0;
      const onMouse = (e: MouseEvent) => {
        targX = e.clientX / window.innerWidth - 0.5;
        targY = e.clientY / window.innerHeight - 0.5;
      };
      if (finePointer)
        window.addEventListener("mousemove", onMouse, { passive: true });

      let visible = true;
      const io = new IntersectionObserver(
        (entries) => {
          visible = entries[0].isIntersecting;
        },
        { threshold: 0 },
      );
      io.observe(hero);

      const pos = geo.attributes.position as THREE.BufferAttribute;
      const clock = new THREE.Clock();
      let raf = 0;
      let disposed = false;

      const wave = (t: number) => {
        let k = 0;
        for (let x = 0; x < COLS; x++) {
          for (let y = 0; y < ROWS; y++) {
            const px = (x - COLS / 2) * SPACE;
            const pz = (y - ROWS / 2) * SPACE;
            (pos.array as Float32Array)[k * 3 + 1] =
              Math.sin(px * 0.32 + t) * 0.55 +
              Math.cos(pz * 0.28 + t * 0.8) * 0.45;
            k++;
          }
        }
        pos.needsUpdate = true;
      };

      const frame = () => {
        if (disposed) return;
        if (visible) {
          wave(clock.getElapsedTime() * 0.6);
          mouseX += (targX - mouseX) * 0.04;
          mouseY += (targY - mouseY) * 0.04;
          points.rotation.y = mouseX * 0.18;
          points.rotation.x = -0.08 + mouseY * 0.1;
          renderer.render(scene, camera);
        }
        raf = requestAnimationFrame(frame);
      };
      if (prefersReduced) {
        wave(0);
        renderer.render(scene, camera);
      } else {
        raf = requestAnimationFrame(frame);
      }

      cleanupFns.push(() => {
        disposed = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMouse);
        io.disconnect();
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        particleMatRef.current = null;
      });
    })();

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      cleanupFns.forEach((fn) => fn());
      ctx.revert();
      if (lenisTick) gsap.ticker.remove(lenisTick);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mobile menu: lock scroll + stagger links in
  useEffect(() => {
    const lenis = lenisRef.current;
    if (menuOpen) {
      lenis?.stop();
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.fromTo(
          ".lv2 .mobile-menu .mm-link",
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.06,
            ease: "power3.out",
            delay: 0.1,
          },
        );
      }
    } else {
      lenis?.start();
    }
  }, [menuOpen]);

  const scrollToHash = (
    e: React.MouseEvent<HTMLAnchorElement>,
    hash: string,
  ) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.querySelector(hash);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el as HTMLElement, {
        offset: -70,
        duration: 1.2,
      });
    } else {
      window.scrollTo({
        top:
          (el as HTMLElement).getBoundingClientRect().top + window.scrollY - 70,
        behavior: "smooth",
      });
    }
  };

  const toggleTheme = () =>
    setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <div ref={rootRef} className={`lv2${menuOpen ? " menu-open" : ""}`}>
      {/* Preloader */}
      <div className="preloader">
        <div
          className="pre-brand"
          style={{ opacity: 0, transform: "translateY(20px)" }}
        >
          Social<em>plus</em>
        </div>
        <div className="pre-line">
          <span />
        </div>
      </div>

      {/* Custom cursor */}
      <div className="cursor-ring" />
      <div className="cursor-dot" />

      {/* ─────────── Nav ─────────── */}
      <nav className="nav">
        <div className="nav-inner">
          <a
            href="#top"
            className="brand"
            onClick={(e) => scrollToHash(e, "#top")}
          >
            <span className="logo">S</span>Social<em>plus</em>
          </a>
          <div className="nav-links">
            <a href="#features" onClick={(e) => scrollToHash(e, "#features")}>
              Features
            </a>
            <a href="#workflow" onClick={(e) => scrollToHash(e, "#workflow")}>
              Workflow
            </a>
            <a href="#pricing" onClick={(e) => scrollToHash(e, "#pricing")}>
              Pricing
            </a>
            <a href="#changelog" onClick={(e) => scrollToHash(e, "#changelog")}>
              Changelog
            </a>
          </div>
          <div className="nav-right">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
            <Link href="/login" className="btn btn-sm">
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Start free
            </Link>
            <button
              className="menu-btn"
              aria-label="Menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
        <div className="nav-progress" />
      </nav>

      {/* Mobile menu */}
      <div className="mobile-menu">
        <nav>
          <a
            className="mm-link"
            href="#features"
            onClick={(e) => scrollToHash(e, "#features")}
          >
            <span className="idx">01</span>Features
          </a>
          <a
            className="mm-link"
            href="#workflow"
            onClick={(e) => scrollToHash(e, "#workflow")}
          >
            <span className="idx">02</span>Workflow
          </a>
          <a
            className="mm-link"
            href="#pricing"
            onClick={(e) => scrollToHash(e, "#pricing")}
          >
            <span className="idx">03</span>Pricing
          </a>
          <a
            className="mm-link"
            href="#changelog"
            onClick={(e) => scrollToHash(e, "#changelog")}
          >
            <span className="idx">04</span>Changelog
          </a>
        </nav>
        <div className="mm-foot">
          <Link href="/login" className="btn">
            Sign in
          </Link>
          <Link href="/signup" className="btn btn-primary">
            Start free
          </Link>
        </div>
      </div>

      {/* ─────────── Hero ─────────── */}
      <header className="hero" id="top">
        <canvas id="heroCanvas" aria-hidden="true" />
        <div className="hero-fade" />
        <div className="wrap">
          <div className="hero-tag">
            <span className="dot" /> v2.0 — AI Composer is live
          </div>
          <h1 className="split" id="heroH1">
            One studio for <em>four</em>
            <br />
            platforms. <span className="accent">Published in seconds.</span>
          </h1>
          <p className="hero-sub">
            Socialplus is a quiet, editorial workspace for people who post a
            lot. Write once, preview everywhere, schedule the week — across X,
            LinkedIn, Instagram and YouTube.
          </p>
          <div className="hero-cta">
            <Link href="/signup" className="btn btn-primary" data-magnet="">
              Start free — 14 days
            </Link>
            <a
              href="#features"
              className="btn"
              data-magnet=""
              onClick={(e) => scrollToHash(e, "#features")}
            >
              See how it works <span className="arr">→</span>
            </a>
          </div>
          <div className="hero-meta">
            <span className="stars">★★★★★</span>
            <span>4.9 from 2,400+ creators</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>No credit card required</span>
          </div>

          {/* Hero product mock */}
          <div className="hero-mock-wrap">
            <div className="hero-mock" data-tilt="3">
              <div className="hero-mock-bar">
                <div className="dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="url">app.socialplus.io / composer</div>
              </div>
              <div className="hero-mock-body">
                <aside className="hm-side">
                  <div className="grp">Workspace</div>
                  <div className="lnk">
                    <span className="ic" /> Overview
                  </div>
                  <div className="lnk active">
                    <span className="ic" /> Composer
                  </div>
                  <div className="lnk">
                    <span className="ic" /> Calendar
                  </div>
                  <div className="lnk">
                    <span className="ic" /> Analytics
                  </div>
                  <div className="lnk">
                    <span className="ic" /> Accounts
                  </div>
                </aside>
                <main className="hm-main">
                  <div className="crumb">Workspace · New post</div>
                  <h2>Compose</h2>
                  <div className="editor">
                    <span className="typed">{typedText}</span>
                    <span className="caret" />
                  </div>
                  <div className="hm-toolbar">
                    <span className="hm-tag ink">Confident</span>
                    <span className="hm-tag">Warm</span>
                    <span className="hm-tag">Witty</span>
                    <span className="hm-tag" style={{ marginLeft: "auto" }}>
                      ⌘↵ to publish
                    </span>
                  </div>
                </main>
                <aside className="hm-rail">
                  <div className="lbl">Live preview</div>
                  <div className="hm-card">
                    <div className="head">
                      <div className="ava">SP</div>
                      <div className="h">@socialplus</div>
                      <div className="t">2m · X</div>
                    </div>
                    <div className="body">
                      We rebuilt our scheduling engine. Posts now publish in
                      under 200ms across all four platforms…
                    </div>
                  </div>
                  <div className="hm-card">
                    <div className="head">
                      <div className="ava">SP</div>
                      <div className="h">Socialplus</div>
                      <div className="t">2m · LinkedIn</div>
                    </div>
                    <div className="body">
                      We rebuilt our scheduling engine from scratch. Here&apos;s
                      what changed under the hood, and why it matters for
                      creators who post 50+ times a week.
                    </div>
                    <div className="img-ph" />
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────── Logo marquee ─────────── */}
      <section className="logos">
        <span className="label">
          Trusted by writers, makers and small teams at
        </span>
        <div className="marquee">
          {[false, true].map((hidden) => (
            <div
              className="marquee-track"
              aria-hidden={hidden || undefined}
              key={String(hidden)}
            >
              <span className="logo-mark">Lattice</span>
              <span className="logo-mark">Brevity</span>
              <span className="logo-mark">Folio</span>
              <span className="logo-mark">Northstar</span>
              <span className="logo-mark">Quill &amp; Co.</span>
              <span className="logo-mark">Studio West</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── Stats band ─────────── */}
      <section className="stats">
        <div className="wrap" style={{ padding: 0 }}>
          <div className="stats-grid" data-reveal-group="">
            <div className="stat-cell">
              <div className="stat-v">
                <span data-count="2.4" data-decimals="1">
                  0
                </span>
                <span className="unit">M+</span>
              </div>
              <div className="stat-l">posts published</div>
            </div>
            <div className="stat-cell">
              <div className="stat-v">
                <span data-count="200">0</span>
                <span className="unit">ms</span>
              </div>
              <div className="stat-l">median publish time</div>
            </div>
            <div className="stat-cell">
              <div className="stat-v">
                <span data-count="2400" data-comma="1">
                  0
                </span>
                <span className="unit">+</span>
              </div>
              <div className="stat-l">creators &amp; teams</div>
            </div>
            <div className="stat-cell">
              <div className="stat-v">
                <span data-count="4">0</span>
              </div>
              <div className="stat-l">platforms, one studio</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Features ─────────── */}
      <section className="section" id="features">
        <div className="wrap">
          <div className="section-head" data-reveal="">
            <span className="eyebrow">Features · 01 — 05</span>
            <h2>
              Five quiet tools.
              <br />
              <em>One that writes for you.</em>
            </h2>
            <p className="lede">
              Every screen is built on a single editorial system — slow type,
              generous whitespace, no neon. Below: each surface, one at a time.
            </p>
          </div>

          {/* 01 Composer */}
          <div className="feature">
            <div className="feat-ghost" data-parallax="0.25">
              01
            </div>
            <div className="feat-text" data-reveal="">
              <div className="feat-num">01 — Composer</div>
              <h3>
                Write once.
                <br />
                <em>Publish everywhere.</em>
              </h3>
              <p className="lede">
                A single, slow editor at the center. Your text fans out into
                native previews for X, LinkedIn, Instagram and YouTube —
                updating as you type, with per-platform tone you can dial in
                chip-by-chip.
              </p>
              <ul className="feat-list">
                <li>
                  <span className="k">Write</span>
                  <span>
                    One pane, four platforms. No tab-switching. No copy-paste
                    fatigue.
                  </span>
                </li>
                <li>
                  <span className="k">Preview</span>
                  <span>
                    Live cards mirror the real feed: character counts, image
                    crops, link cards.
                  </span>
                </li>
                <li>
                  <span className="k">Tone</span>
                  <span>
                    Tap a chip — Confident, Warm, Witty, Reportorial — to shift
                    voice per channel.
                  </span>
                </li>
              </ul>
              <Link href="/signup" className="feat-link">
                Open the composer <span className="arr">→</span>
              </Link>
            </div>
            <div className="feat-mock" data-reveal="">
              <div className="mock" data-tilt="4">
                <div className="mock-head">
                  <div className="dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="ttl">Composer</div>
                </div>
                <div className="mk-composer">
                  <div className="topline">
                    <span className="glyph">𝕏</span>
                    <span className="glyph">in</span>
                    <span className="glyph muted">Ig</span>
                    <span className="glyph">▶</span>
                  </div>
                  <div className="text">
                    Most schedulers wait. Ours doesn&apos;t.{" "}
                    <span className="muted">
                      We rebuilt the publishing pipeline from scratch —
                      you&apos;ll feel it the first time you hit publish.
                    </span>
                  </div>
                  <div className="slash">
                    <div className="row sel">
                      ✦ Generate hook<span className="hint">↵</span>
                    </div>
                    <div className="row">
                      → Continue writing<span className="hint">tab</span>
                    </div>
                    <div className="row"># Suggest hashtags</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 02 AI */}
          <div className="feature reverse">
            <div className="feat-ghost" data-parallax="0.25">
              02
            </div>
            <div className="feat-text" data-reveal="">
              <div className="feat-num">02 — AI Studio</div>
              <h3>
                An assistant that
                <br />
                <em>reads the room.</em>
              </h3>
              <p className="lede">
                Type <span className="mono mk-pill-code">/</span> in the editor
                — get hooks, hashtags, captions, and full repurposes. Trained on
                your tone, scoped to your audience.
              </p>
              <ul className="feat-list">
                <li>
                  <span className="k">Hooks</span>
                  <span>
                    Sharp first lines, ranked by predicted scroll-stopping
                    power.
                  </span>
                </li>
                <li>
                  <span className="k">Repurpose</span>
                  <span>
                    Turn a long LinkedIn post into a five-tweet thread without
                    rewriting.
                  </span>
                </li>
                <li>
                  <span className="k">Brand</span>
                  <span>
                    Upload a style guide once — every output respects it.
                  </span>
                </li>
              </ul>
              <Link href="/signup" className="feat-link">
                See AI in action <span className="arr">→</span>
              </Link>
            </div>
            <div className="feat-mock" data-reveal="">
              <div className="mock" data-tilt="4">
                <div className="mock-head">
                  <div className="dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="ttl">AI Studio</div>
                </div>
                <div className="mk-ai">
                  <div className="prompt">
                    / generate hook → &quot;shipping calendar&quot;
                  </div>
                  <div className="out">
                    &quot;Most teams ship on Friday afternoons. We ship at 9:14
                    every morning. Here&apos;s the system that made it
                    boring.&quot;
                  </div>
                  <div className="actions">
                    <span className="pill">✦ Try another</span>
                    <span className="pill">⤓ Insert</span>
                    <span className="pill">⌘C Copy</span>
                    <span className="pill quota">12 / 50 today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 03 Calendar */}
          <div className="feature">
            <div className="feat-ghost" data-parallax="0.25">
              03
            </div>
            <div className="feat-text" data-reveal="">
              <div className="feat-num">03 — Calendar</div>
              <h3>
                Your week,
                <br />
                <em>as a river.</em>
              </h3>
              <p className="lede">
                Forget the cramped grid. Posts flow horizontally along the day —
                by hour, by platform, by status. Drag to reschedule. Collisions
                surface themselves.
              </p>
              <ul className="feat-list">
                <li>
                  <span className="k">Hours</span>
                  <span>
                    See the whole week&apos;s rhythm at a glance — peak slots,
                    dead zones.
                  </span>
                </li>
                <li>
                  <span className="k">Status</span>
                  <span>
                    Queued, draft, published — distinguished by ink weight, not
                    color noise.
                  </span>
                </li>
                <li>
                  <span className="k">Drag</span>
                  <span>
                    Move a post to a better slot. Times update across every
                    platform.
                  </span>
                </li>
              </ul>
              <Link href="/signup" className="feat-link">
                Plan your week <span className="arr">→</span>
              </Link>
            </div>
            <div className="feat-mock" data-reveal="">
              <div className="mock" data-tilt="4">
                <div className="mock-head">
                  <div className="dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="ttl">Calendar · Week 19</div>
                </div>
                <div className="mk-cal">
                  <div className="ruler">
                    <span>6am</span>
                    <span>9am</span>
                    <span>12pm</span>
                    <span>3pm</span>
                    <span>6pm</span>
                    <span>9pm</span>
                  </div>
                  <div className="row">
                    <div className="day">
                      <span className="lbl">MON</span>5
                    </div>
                    <div className="lane">
                      <div
                        className="pill published"
                        style={{ left: "18%", width: 130 }}
                      >
                        <span className="glyph">𝕏</span>Monday note…
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="day">
                      <span className="lbl">TUE</span>6
                    </div>
                    <div className="lane">
                      <div className="pill" style={{ left: "24%", width: 170 }}>
                        <span className="glyph">in</span>Rebuilt our engine…
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="day today">
                      <span className="lbl">WED</span>7
                    </div>
                    <div className="lane">
                      <div className="pill" style={{ left: "32%", width: 140 }}>
                        <span className="glyph">𝕏</span>Live Q&amp;A now
                      </div>
                      <div className="pill" style={{ left: "62%", width: 130 }}>
                        <span className="glyph">▶</span>Behind the scenes
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="day">
                      <span className="lbl">THU</span>8
                    </div>
                    <div className="lane">
                      <div className="pill" style={{ left: "18%", width: 160 }}>
                        <span className="glyph">in</span>Three CI patterns
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 04 Analytics */}
          <div className="feature reverse">
            <div className="feat-ghost" data-parallax="0.25">
              04
            </div>
            <div className="feat-text" data-reveal="">
              <div className="feat-num">04 — Analytics</div>
              <h3>
                Numbers, but
                <br />
                <em>read like a story.</em>
              </h3>
              <p className="lede">
                &quot;You reached 2.41M people this month. Up 18%.&quot; We open
                with the headline, not the dashboard. Drill in only if you want
                to.
              </p>
              <ul className="feat-list">
                <li>
                  <span className="k">Headline</span>
                  <span>
                    Plain-English summaries surface what changed and why.
                  </span>
                </li>
                <li>
                  <span className="k">Compare</span>
                  <span>
                    Stack platforms on one chart. See which channel pulls its
                    weight.
                  </span>
                </li>
                <li>
                  <span className="k">Best time</span>
                  <span>
                    We learn your audience and recommend the next slot to post.
                  </span>
                </li>
              </ul>
              <Link href="/signup" className="feat-link">
                Read your numbers <span className="arr">→</span>
              </Link>
            </div>
            <div className="feat-mock" data-reveal="">
              <div className="mock" data-tilt="4">
                <div className="mock-head">
                  <div className="dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="ttl">Analytics · 30d</div>
                </div>
                <div className="mk-an">
                  <div className="top">
                    <div className="stat">
                      <div className="lbl">Reach</div>
                      <div className="v">2.41M</div>
                      <div className="d">+18%</div>
                    </div>
                    <div className="stat">
                      <div className="lbl">Engagement</div>
                      <div className="v">124.5K</div>
                      <div className="d">+12%</div>
                    </div>
                    <div className="stat">
                      <div className="lbl">Best slot</div>
                      <div className="v sm">Thu · 10am</div>
                      <div className="d quiet">predicted</div>
                    </div>
                  </div>
                  <svg viewBox="0 0 600 100" preserveAspectRatio="none">
                    <polyline
                      points="0,80 50,72 100,68 150,55 200,58 250,42 300,38 350,30 400,32 450,22 500,18 550,12 600,10"
                      fill="none"
                      stroke="var(--ink)"
                      strokeWidth="1.5"
                    />
                    <polyline
                      points="0,90 50,86 100,82 150,78 200,72 250,68 300,62 350,58 400,54 450,48 500,44 550,40 600,36"
                      fill="none"
                      stroke="var(--ink-3)"
                      strokeWidth="1.5"
                    />
                    <polyline
                      points="0,95 50,92 100,90 150,88 200,86 250,82 300,80 350,78 400,76 450,72 500,70 550,68 600,64"
                      fill="none"
                      stroke="var(--ink-4)"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <div className="bars">
                    <div className="bar-row">
                      <span className="l">X / Twitter</span>
                      <div className="bar">
                        <span style={{ width: "84%" }} />
                      </div>
                      <span className="r">845K</span>
                    </div>
                    <div className="bar-row">
                      <span className="l">LinkedIn</span>
                      <div className="bar">
                        <span style={{ width: "62%" }} />
                      </div>
                      <span className="r">612K</span>
                    </div>
                    <div className="bar-row">
                      <span className="l">YouTube</span>
                      <div className="bar">
                        <span style={{ width: "42%" }} />
                      </div>
                      <span className="r">421K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 05 Accounts */}
          <div className="feature">
            <div className="feat-ghost" data-parallax="0.25">
              05
            </div>
            <div className="feat-text" data-reveal="">
              <div className="feat-num">05 — Accounts</div>
              <h3>
                Connect once.
                <br />
                <em>We handle the rest.</em>
              </h3>
              <p className="lede">
                OAuth into all four platforms in 90 seconds. Tokens refresh
                themselves. We warn you a week before anything expires — no
                surprise outages on launch day.
              </p>
              <ul className="feat-list">
                <li>
                  <span className="k">Auto</span>
                  <span>
                    Tokens refresh in the background. You never manage
                    credentials.
                  </span>
                </li>
                <li>
                  <span className="k">Warn</span>
                  <span>
                    Email + in-app alert seven days before expiry, with
                    one-click reconnect.
                  </span>
                </li>
                <li>
                  <span className="k">Audit</span>
                  <span>
                    Full log of every publish — who, what, when, which API.
                  </span>
                </li>
              </ul>
              <Link href="/signup" className="feat-link">
                Connect your accounts <span className="arr">→</span>
              </Link>
            </div>
            <div className="feat-mock" data-reveal="">
              <div className="mock" data-tilt="4">
                <div className="mock-head">
                  <div className="dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="ttl">Connected accounts</div>
                </div>
                <div className="mk-acc">
                  <div className="row">
                    <span className="glyph">𝕏</span>
                    <div>
                      <div className="h">X / Twitter</div>
                      <div className="sh">@socialplus · 42.1K followers</div>
                    </div>
                    <span className="status">● Active</span>
                    <span className="since">since Mar 2025</span>
                  </div>
                  <div className="row">
                    <span className="glyph">in</span>
                    <div>
                      <div className="h">LinkedIn</div>
                      <div className="sh">Socialplus · 68.3K followers</div>
                    </div>
                    <span className="status">● Active</span>
                    <span className="since">since Jan 2024</span>
                  </div>
                  <div className="row">
                    <span className="glyph">▶</span>
                    <div>
                      <div className="h">YouTube</div>
                      <div className="sh">Socialplus · 21.7K followers</div>
                    </div>
                    <span className="status">● Active</span>
                    <span className="since">since Aug 2024</span>
                  </div>
                  <div className="row">
                    <span className="glyph muted">Ig</span>
                    <div>
                      <div className="h">Instagram</div>
                      <div className="sh">@socialplus · token expired</div>
                    </div>
                    <span className="status warn">● Expired</span>
                    <Link className="btn btn-sm" href="/signup">
                      Reconnect
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Workflow ─────────── */}
      <section className="section" id="workflow">
        <div className="wrap">
          <div className="section-head" data-reveal="">
            <span className="eyebrow">Workflow</span>
            <h2>
              From blank page
              <br />
              <em>to four platforms.</em>
            </h2>
            <p className="lede">
              A typical post takes ninety seconds, start to finish.
            </p>
          </div>
          <div className="steps-line">
            <span />
          </div>
          <div className="steps" data-reveal-group="">
            <div className="step">
              <div className="num">01 / Connect</div>
              <h4>Plug in your accounts.</h4>
              <p>
                OAuth into X, LinkedIn, Instagram, and YouTube. Ninety seconds,
                four clicks.
              </p>
            </div>
            <div className="step">
              <div className="num">02 / Compose</div>
              <h4>Write one post.</h4>
              <p>
                Open the editor. Type — or hit <span className="mono">/</span>{" "}
                to let AI draft. Set the tone per channel.
              </p>
            </div>
            <div className="step">
              <div className="num">03 / Schedule</div>
              <h4>Pick a slot.</h4>
              <p>
                The calendar suggests your best time. Drag to anywhere else.
                Done.
              </p>
            </div>
            <div className="step">
              <div className="num">04 / Measure</div>
              <h4>Read the numbers.</h4>
              <p>Headlines, not heatmaps. We tell you what&apos;s working.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Testimonials ─────────── */}
      <section className="section">
        <div className="wrap">
          <div className="section-head" data-reveal="">
            <span className="eyebrow">Voices</span>
            <h2>
              What people say
              <br />
              <em>about Socialplus.</em>
            </h2>
          </div>
          <div className="tgrid" data-reveal-group="">
            <div className="tcard">
              <q>
                I used to keep four browser tabs open and a Google Doc to track
                everything. Now I just open one window. The composer alone is
                worth the price.
              </q>
              <div className="who">
                <div className="ava">MR</div>
                <div>
                  <div className="nm">Maria Rodríguez</div>
                  <div className="ro">Founder · Brevity</div>
                </div>
              </div>
            </div>
            <div className="tcard">
              <q>
                The week-river calendar is the first scheduler I haven&apos;t
                fought with. It looks like how I actually think about my week.
              </q>
              <div className="who">
                <div className="ava">JK</div>
                <div>
                  <div className="nm">Jin Kim</div>
                  <div className="ro">Editor · Folio</div>
                </div>
              </div>
            </div>
            <div className="tcard">
              <q>
                I post sixty times a week across four platforms. Socialplus
                turned a daily three-hour ritual into a forty-minute Monday
                morning.
              </q>
              <div className="who">
                <div className="ava">AT</div>
                <div>
                  <div className="nm">Aki Tanaka</div>
                  <div className="ro">Creator · 142k followers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Pricing ─────────── */}
      <section className="section" id="pricing">
        <div className="wrap">
          <div className="section-head" data-reveal="">
            <span className="eyebrow">Pricing</span>
            <h2>
              Three plans.
              <br />
              <em>No surprises.</em>
            </h2>
            <p className="lede">
              Start free. Upgrade when you outgrow it. Cancel any time, no email
              tug-of-war.
            </p>
          </div>
          <div className="pgrid" data-reveal-group="">
            <div className="plan">
              <div className="nm">Solo</div>
              <div className="pr">
                $0<small>/mo</small>
              </div>
              <div className="desc">For one creator finding their voice.</div>
              <ul>
                <li>2 connected accounts</li>
                <li>10 scheduled posts</li>
                <li>20 AI generations / month</li>
                <li>Basic analytics</li>
              </ul>
              <Link href="/signup" className="btn">
                Start free
              </Link>
            </div>
            <div className="plan feat">
              <div className="nm">
                Pro <span className="pop">most popular</span>
              </div>
              <div className="pr">
                $19<small>/mo</small>
              </div>
              <div className="desc">For makers shipping content weekly.</div>
              <ul>
                <li>All 4 platforms</li>
                <li>Unlimited scheduled posts</li>
                <li>500 AI generations / month</li>
                <li>Full analytics + best-time AI</li>
                <li>Brand voice training</li>
              </ul>
              <Link href="/signup" className="btn btn-primary">
                Try Pro free
              </Link>
            </div>
            <div className="plan">
              <div className="nm">Team</div>
              <div className="pr">
                $49<small>/seat</small>
              </div>
              <div className="desc">For small teams with shared inboxes.</div>
              <ul>
                <li>Everything in Pro</li>
                <li>Approval workflows</li>
                <li>Shared content library</li>
                <li>Audit log + role permissions</li>
                <li>Priority support</li>
              </ul>
              <Link href="/signup" className="btn">
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Final CTA ─────────── */}
      <section className="cta" id="cta">
        <div className="wrap">
          <h2 className="split" id="ctaH2">
            Spend less time
            <br />
            <em>posting.</em> More time
            <br />
            making.
          </h2>
          <p data-reveal="">
            Free for fourteen days. No credit card. No onboarding call. Just a
            quieter way to publish.
          </p>
          <div className="cta-row" data-reveal="">
            <Link href="/signup" className="btn btn-primary" data-magnet="">
              Start free trial
            </Link>
            <Link href="/signup" className="btn" data-magnet="">
              Book a demo
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────── Footer ─────────── */}
      <footer className="footer" id="changelog">
        <div className="wrap">
          <div className="foot-top">
            <div className="foot-brand">
              <a
                href="#top"
                className="brand"
                onClick={(e) => scrollToHash(e, "#top")}
              >
                <span className="logo">S</span>Social<em>plus</em>
              </a>
              <p className="blurb">
                A quiet, editorial workspace for people who post a lot. Made in
                Berlin &amp; Bangalore.
              </p>
              <form
                className="news"
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.querySelector("input");
                  if (input) input.value = "";
                }}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  aria-label="Email"
                />
                <button type="submit">Subscribe</button>
              </form>
            </div>
            <div>
              <h5>Product</h5>
              <ul>
                <li>
                  <a
                    href="#features"
                    onClick={(e) => scrollToHash(e, "#features")}
                  >
                    Composer
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    onClick={(e) => scrollToHash(e, "#features")}
                  >
                    AI Studio
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    onClick={(e) => scrollToHash(e, "#features")}
                  >
                    Calendar
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    onClick={(e) => scrollToHash(e, "#features")}
                  >
                    Analytics
                  </a>
                </li>
                <li>
                  <a
                    href="#changelog"
                    onClick={(e) => scrollToHash(e, "#changelog")}
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5>Company</h5>
              <ul>
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#">Manifesto</a>
                </li>
                <li>
                  <a href="#">Press</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
            <div>
              <h5>Resources</h5>
              <ul>
                <li>
                  <a href="#">Documentation</a>
                </li>
                <li>
                  <a href="#">API reference</a>
                </li>
                <li>
                  <a href="#">Templates</a>
                </li>
                <li>
                  <a href="#">Status</a>
                </li>
                <li>
                  <a href="#">Community</a>
                </li>
              </ul>
            </div>
            <div>
              <h5>Legal</h5>
              <ul>
                <li>
                  <a href="#">Terms</a>
                </li>
                <li>
                  <a href="#">Privacy</a>
                </li>
                <li>
                  <a href="#">Cookies</a>
                </li>
                <li>
                  <a href="#">Security</a>
                </li>
                <li>
                  <a href="#">DPA</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="foot-bot">
            <span className="copy">
              © 2026 Socialplus, Inc. · All rights reserved · Built with
              patience.
            </span>
            <div className="socials">
              <a href="#" title="X">
                𝕏
              </a>
              <a href="#" title="LinkedIn">
                in
              </a>
              <a href="#" title="GitHub">
                {"{ }"}
              </a>
              <a href="#" title="YouTube">
                ▶
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
