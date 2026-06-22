"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { VizPrompt, VizStream, VizDashboard, VizRace } from "./Visualizations";
import type { HomepageScene } from "@/lib/content";

const DEFAULT_SCENES: HomepageScene[] = [
  {
    num: "01",
    heading: "It starts with one prompt",
    body: "Type the dashboard you want in plain English. A slash command hands it to the agent. No tickets, no BI backlog, no SQL.",
    tag: "/xfalcon-dashboard",
    url: "xFalcon.ai · workspace",
  },
  {
    num: "02",
    heading: "Watch it actually build",
    body: "xFalcon asks what a senior analyst would — fiscal calendar, segments, comparison basis — then reads your warehouse and writes the portal, file by file.",
    tag: "38 tables · 412 columns",
    url: "xFalcon.ai · building /xfalcon-dashboard",
  },
  {
    num: "03",
    heading: "A live portal, not a slide",
    body: "Out comes the Falcon Finance portal: seven KPIs, trend and regional charts, ten drill-down modules. Real numbers, this week vs. the same week last year.",
    tag: "7 KPIs · 4 charts · 10 modules",
    url: "xFalcon.ai/demos/falcon-finance",
  },
  {
    num: "04",
    heading: "Same dashboard. Two timelines.",
    body: "What's normally a twelve-week BI project — scoping, modeling, dev backlog, rework — xFalcon ships in an afternoon.",
    tag: "Live in 00:47",
    url: "xFalcon.ai · time-to-dashboard",
  },
];

const VIZ = [VizPrompt, VizStream, VizDashboard, VizRace];

function BrowserBar({ url }: { url: string }) {
  const [shown, setShown] = useState(url);
  useEffect(() => {
    setShown("");
    const t = setTimeout(() => setShown(url), 150);
    return () => clearTimeout(t);
  }, [url]);

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 42,
      background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", gap: 7, padding: "0 16px", zIndex: 5,
    }}>
      <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f56", display: "inline-block" }} />
      <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
      <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#27c93f", display: "inline-block" }} />
      <motion.span
        key={shown}
        initial={{ opacity: 0 }}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          marginLeft: 10, fontFamily: "'SF Mono',ui-monospace,monospace", fontSize: 11,
          color: "var(--ink-soft)", background: "rgba(255,255,255,0.05)",
          borderRadius: 6, padding: "4px 12px",
        }}
      >{shown}</motion.span>
    </div>
  );
}

interface ScrollStoryProps {
  content?: HomepageScene[];
}

export default function ScrollStory({ content }: ScrollStoryProps) {
  const scenes = content ?? DEFAULT_SCENES;
  const [active, setActive] = useState(0);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ActiveViz = VIZ[Math.min(active, VIZ.length - 1)];
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const obs = sceneRefs.current.map((el, i) => {
      if (!el) return null;
      const o = new IntersectionObserver(
        (entries) => { entries.forEach(e => { if (e.isIntersecting) setActive(i); }); },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      o.observe(el);
      return o;
    });
    return () => obs.forEach(o => o?.disconnect());
  }, []);

  const vizTransition = reducedMotion
    ? { duration: 0.15 }
    : { duration: 0.45, ease: "easeInOut" as const };

  return (
    <section id="scroll-story" style={{ padding: "80px 0 120px" }}>

      {/* ── Section header ── */}
      <div className="container" style={{ textAlign: "center", marginBottom: 72 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>How it works</div>
        <h2 style={{
          fontSize: "clamp(30px,4vw,48px)", fontWeight: 800,
          letterSpacing: "-0.025em", maxWidth: 560, margin: "0 auto", color: "var(--ink)",
        }}>
          From prompt to portal in minutes
        </h2>
      </div>

      {/*
        STRUCTURE mirrors the reference HTML exactly:

          .scrolly-grid  (IS the container — has max-width + padding, no extra wrapper)
          ├── .ss-scenes       left col: 4 scenes × min-height 92vh ≈ 368vh tall
          └── .ss-stickywrap   right col: STRETCHES to 368vh (default grid stretch)
                └── .ss-sticky   position:sticky top:0 height:100vh
                      └── panel  has 268vh of travel → sticks through all 4 scenes

        NOT inside a .container wrapper — that extra div was breaking sticky
        by adding another ancestor level between the grid and the scroll root.
      */}
      <div className="scrolly-grid">

        {/* LEFT — text scenes, scroll normally */}
        <div className="ss-scenes">
          {scenes.map((sc, i) => (
            <div
              key={i}
              ref={el => { sceneRefs.current[i] = el; }}
              className={`ss-scene${active === i ? " active" : ""}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.14em", opacity: 0.7 }}>Step</span>
                <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em" }}>{sc.num}</span>
              </div>
              <h3 style={{ fontSize: "clamp(24px,3.2vw,40px)", fontWeight: 800, letterSpacing: "-0.022em", lineHeight: 1.1, color: "var(--ink)" }}>
                {sc.heading.includes("Two timelines")
                  ? <>Same dashboard. <span style={{ color: "var(--accent)" }}>Two timelines.</span></>
                  : sc.heading.includes("one prompt")
                  ? <>It starts with <span style={{ color: "var(--accent)" }}>one prompt</span></>
                  : sc.heading}
              </h3>
              <p style={{ fontSize: "clamp(15px,1.8vw,18px)", color: "var(--ink-soft)", maxWidth: "40ch", lineHeight: 1.65 }}>
                {sc.body}
              </p>
              <span style={{
                display: "inline-flex", alignItems: "center", alignSelf: "flex-start", marginTop: 4,
                fontFamily: "'SF Mono',ui-monospace,monospace", fontSize: 12, fontWeight: 600,
                color: "var(--accent)", background: "rgba(46,209,237,0.10)",
                border: "1px solid rgba(46,209,237,0.24)", padding: "6px 14px", borderRadius: 999,
              }}>{sc.tag}</span>
            </div>
          ))}
        </div>

        {/* RIGHT — stretched wrapper → sticky inner */}
        <div className="ss-stickywrap">
          <div className="ss-sticky">

            <div style={{
              position: "relative", width: "100%", maxWidth: 560,
              aspectRatio: "4/3", margin: "0 auto",
              background: "var(--panel)",
              border: "1px solid rgba(46,209,237,0.20)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-panel)",
              overflow: "hidden",
            }}>
              <BrowserBar url={scenes[active]?.url ?? ""} />

              {/* Dot nav — desktop only */}
              <div className="ss-dots">
                {scenes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => sceneRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                    aria-label={`Go to step ${i + 1}`}
                    style={{
                      width: 8, height: 8, borderRadius: "50%", border: "none", cursor: "pointer",
                      padding: 0, transition: "all 0.3s",
                      background: active === i ? "var(--accent)" : "rgba(255,255,255,0.12)",
                      transform: active === i ? "scale(1.6)" : "scale(1)",
                      boxShadow: active === i ? "0 0 10px var(--accent)" : "none",
                    }}
                  />
                ))}
              </div>

              {/* Crossfading visualisation */}
              <div style={{
                position: "absolute", inset: 0, top: 42,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "24px",
              }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                    exit={reducedMotion   ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
                    transition={vizTransition}
                    style={{ width: "100%" }}
                  >
                    <ActiveViz />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        /* ─── The grid IS the container (no extra wrapper div) ─────────────── */
        .scrolly-grid {
          position: relative;
          display: grid;
          grid-template-columns: 0.92fr 1.08fr;
          gap: 48px;
          max-width: var(--container-max);
          margin-left: auto;
          margin-right: auto;
          padding-left: var(--section-pad-x);
          padding-right: var(--section-pad-x);
        }

        /* Text column */
        .ss-scenes { display: flex; flex-direction: column; }
        .ss-scene {
          min-height: 92vh;
          display: flex; flex-direction: column; justify-content: center; gap: 14px;
          opacity: 0.3;
          transition: opacity 0.45s ease;
        }
        .ss-scene.active { opacity: 1; }

        /* Sticky column — stickywrap STRETCHES (default grid stretch) to ~368vh */
        .ss-stickywrap { position: relative; }
        .ss-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Dot nav */
        .ss-dots {
          position: absolute;
          right: -30px; top: 50%; transform: translateY(-50%);
          display: flex; flex-direction: column; gap: 12px; z-index: 6;
        }

        /* ─── Mobile: un-pin, visual on top ─── */
        @media (max-width: 1023px) {
          .scrolly-grid { grid-template-columns: 1fr; gap: 0; }
          .ss-stickywrap { grid-row: 1; }
          .ss-sticky { position: relative; height: auto; padding: 10px 0 32px; }
          .ss-dots { display: none; }
          .ss-scene { min-height: auto; padding: 48px 0; opacity: 1; border-bottom: 1px solid var(--line); }
        }

        @media (max-width: 639px) {
          .ss-scene { padding: 32px 0; }
          .ss-sticky > div { max-height: 280px; overflow: hidden; }
        }
      `}</style>
    </section>
  );
}
