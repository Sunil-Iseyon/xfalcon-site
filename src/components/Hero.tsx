"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { fadeUpVariant, staggerContainer, defaultViewport } from "@/lib/motion";
import type { HomepageContent, HomepageStat } from "@/lib/content";

function animateCount(from: number, to: number, duration: number, onUpdate: (n: number) => void) {
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    onUpdate(Math.round(from + eased * (to - from)));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function AnimatedStat({ value, reducedMotion }: { value: string; reducedMotion: boolean | null }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true });
  const [display, setDisplay] = useState(() => {
    if (value.startsWith("00:")) return "00:00";
    if (value.endsWith("+")) return "0+";
    const n = parseInt(value, 10);
    return isNaN(n) ? value : "0";
  });

  useEffect(() => {
    if (!isInView) return;
    if (reducedMotion) { setDisplay(value); return; }

    if (value.startsWith("00:")) {
      const target = parseInt(value.slice(3), 10);
      animateCount(0, target, 1400, n => setDisplay(`00:${String(n).padStart(2, "0")}`));
    } else if (value.endsWith("+")) {
      const target = parseInt(value.slice(0, -1), 10);
      animateCount(0, target, 1400, n => setDisplay(`${n}+`));
    } else {
      const target = parseInt(value, 10);
      if (!isNaN(target)) {
        animateCount(0, target, 1000, n => setDisplay(String(n)));
      } else {
        setDisplay(value);
      }
    }
  }, [isInView, value, reducedMotion]);

  return <span ref={ref}>{display}</span>;
}

interface HeroProps {
  content?: HomepageContent["hero"];
  stats?:   HomepageStat[];
}

const DEFAULT_CONTENT: HomepageContent["hero"] = {
  eyebrowText:  "AI-Powered Analytics Platform",
  headline:     "What if a dashboard took one prompt?",
  subheadline:  "Skip the tickets, the BI backlog, and the SQL. One slash command hands it to the agent — a live portal ships the same afternoon.",
  primaryCta:   { label: "Explore Demos", href: "/#demo-wall" },
  secondaryCta: { label: "See how it works", href: "#scroll-story" },
};

const DEFAULT_STATS: HomepageStat[] = [
  { value: "00:47", label: "Avg. time to live portal" },
  { value: "30+",   label: "Industry demo portals" },
  { value: "1",     label: "Prompt to ship" },
];

export default function Hero({ content, stats }: HeroProps) {
  const c = content ?? DEFAULT_CONTENT;
  const s = stats   ?? DEFAULT_STATS;
  const reducedMotion = useReducedMotion();

  const animProps = reducedMotion
    ? { variants: { hidden: { opacity: 0 }, visible: { opacity: 1 } }, initial: "hidden" as const, animate: "visible" as const }
    : { variants: staggerContainer, initial: "hidden" as const, animate: "visible" as const };

  return (
    <section className="hero-section" style={{
      minHeight: "100svh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "120px 24px 80px",
      position: "relative",
    }}>

      {/* Background glow orb */}
      <div aria-hidden="true" style={{
        position:"absolute", top:"15%", left:"50%", transform:"translateX(-50%)",
        width:700, height:400, borderRadius:"50%",
        background:"radial-gradient(ellipse, rgba(46,209,237,0.08) 0%, transparent 70%)",
        pointerEvents:"none", zIndex:0,
      }} />

      <motion.div {...animProps} style={{ position:"relative", zIndex:1, width:"100%", maxWidth:860, margin:"0 auto" }}>

        {/* Eyebrow */}
        <motion.div variants={fadeUpVariant} viewport={defaultViewport}
          style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(46,209,237,0.10)", border:"1px solid rgba(46,209,237,0.25)",
            borderRadius:999, padding:"7px 16px",
            fontSize:12, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--accent)",
          }}>
            <span style={{
              width:6, height:6, borderRadius:"50%", background:"var(--accent)",
              display:"inline-block", animation:"pulse-ring 2.2s ease-out infinite",
            }} />
            {c.eyebrowText}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={fadeUpVariant} viewport={defaultViewport} style={{
          fontSize: "clamp(40px, 6.5vw, 82px)",
          fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.04,
          marginBottom: 28, color: "var(--ink)",
        }}>
          {c.headline.includes("one prompt")
            ? <>What if a dashboard<br />took <span className="grad-text">one prompt?</span></>
            : c.headline
          }
        </motion.h1>

        {/* Subheadline */}
        <motion.p variants={fadeUpVariant} viewport={defaultViewport} style={{
          fontSize: "clamp(16px, 2vw, 20px)", color: "var(--ink-soft)",
          maxWidth: 560, margin: "0 auto 44px", lineHeight: 1.6,
        }}>
          {c.subheadline}
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUpVariant} viewport={defaultViewport}
          className="hero-cta"
          style={{ display:"flex", flexWrap:"wrap", gap:14, justifyContent:"center", marginBottom:72 }}>
          {/* Primary CTA — commented out for future use */}
          {/* <a
            href={c.primaryCta.href}
            className="btn-primary"
            onClick={e => {
              const href = c.primaryCta.href;
              if (href.startsWith("#") || href.startsWith("/#")) {
                e.preventDefault();
                const id = href.replace(/^\/?#/, "");
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            {c.primaryCta.label}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a> */}
          <a href={c.secondaryCta.href} className="btn-outline hero-cta-secondary">
            {c.secondaryCta.label}
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={fadeUpVariant} viewport={defaultViewport}
          className="hero-stats"
          style={{
            display:"grid",
            gridTemplateColumns:"repeat(3,1fr)",
            borderTop:"1px solid var(--line)",
            paddingTop: 40,
          }}>
          {s.map((stat, i) => (
            <div key={stat.label} className="hero-stat-item" style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:6,
              padding:"0 16px",
              borderRight: i < s.length - 1 ? "1px solid var(--line)" : "none",
            }}>
              <span className="mono" style={{ fontSize: "clamp(26px,3.5vw,36px)", fontWeight:700, color:"var(--accent)" }}>
                <AnimatedStat value={stat.value} reducedMotion={reducedMotion} />
              </span>
              <span style={{ fontSize:12, color:"var(--ink-mute)", letterSpacing:"0.04em", textAlign:"center" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.1, duration:0.8 }}
        style={{ position:"absolute", bottom:36, left:"50%", transform:"translateX(-50%)",
          display:"flex", flexDirection:"column", alignItems:"center", gap:6,
          fontSize:11, color:"var(--ink-mute)", letterSpacing:"0.1em", textTransform:"uppercase" }}
      >
        Scroll
        <span style={{ fontSize:18, color:"var(--accent)" }} className="animate-bob">↓</span>
      </motion.div>

      <style>{`
        @media(max-width:639px){
          .hero-section { padding-top: 96px !important; }
          .hero-cta { flex-direction: column !important; align-items: stretch !important; max-width: 320px; margin-left: auto; margin-right: auto; }
          .hero-cta a, .hero-cta button { width: 100%; text-align: center; justify-content: center; }
          /* Stats: single row, no dividers */
          .hero-stats { display: flex !important; flex-direction: row !important; justify-content: center !important; gap: 32px !important; grid-template-columns: unset !important; }
          .hero-stat-item { border-right: none !important; border-bottom: none !important; padding: 0 !important; flex: 0 0 auto !important; }
        }
      `}</style>
    </section>
  );
}
