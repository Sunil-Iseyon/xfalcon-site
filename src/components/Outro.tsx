"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { WALL_DEMOS } from "@/data/demos";
import { fadeUpVariant, staggerContainer, staggerFastContainer, cardHover, defaultViewport } from "@/lib/motion";
import type { HomepageContent } from "@/lib/content";

interface OutroProps {
  content?: HomepageContent;
}

const DEFAULT_FEATURES = [
  {
    icon: "🤖",
    title: "AI-Native Dashboard Generation",
    body: "Built from the ground up for AI. One prompt generates production-ready dashboards with intelligent schema discovery and auto-generated SQL.",
  },
  {
    icon: "🏢",
    title: "Enterprise Ready",
    body: "SOC 2 compliant, role-based access, audit logs, and SSO. Connect to Snowflake, BigQuery, Redshift, and any warehouse securely.",
  },
  {
    icon: "⚡",
    title: "Rapid Deployment",
    body: "What normally takes 12 weeks ships in an afternoon. From slash command to live portal — no tickets, no BI backlog, no SQL required.",
  },
  {
    icon: "🎨",
    title: "Fully Customizable",
    body: "Every dashboard adapts to your brand, data model, and workflow. Modify layouts, KPIs, and drill-downs without touching code.",
  },
  {
    icon: "🌐",
    title: "Cross-Industry Templates",
    body: "30+ pre-built industry portals spanning healthcare, finance, retail, manufacturing, and beyond — ready to deploy or customize.",
  },
  {
    icon: "🤝",
    title: "Human + AI Workflow",
    body: "xFalcon asks the right clarifying questions before building. A collaborative AI that thinks like a senior analyst, not just a code generator.",
  },
];

// WALL_INDUSTRIES kept for future tab filter use
// const WALL_INDUSTRIES = ["All", ...Array.from(new Set(WALL_DEMOS.map(d => d.industry)))];

export default function Outro({ content }: OutroProps) {
  const features = content?.features ?? DEFAULT_FEATURES;
  const outro    = content?.outro;
  const reducedMotion = useReducedMotion();
  // activeTab/filteredWall preserved for future tab filter use
  // const [activeTab, setActiveTab] = useState("All");
  // const filteredWall = WALL_DEMOS.filter(d => activeTab === "All" || d.industry === activeTab);

  const wallRef    = useRef(null);
  const wallInView = useInView(wallRef, { once:true, margin:"-80px" });

  const hoverProps = reducedMotion ? {} : cardHover;

  return (
    <>
      {/* ── Features strip ─────────────────────────────────── */}
      <section id="why-xfalcon" style={{ padding:"clamp(64px,8vw,100px) 0", borderTop:"1px solid var(--line)" }}>
        <div className="container">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <div style={{ textAlign:"center", marginBottom:64 }}>
              <motion.div variants={fadeUpVariant} className="eyebrow" style={{ marginBottom:14 }}>
                Why xFalcon
              </motion.div>
              <motion.h2 variants={fadeUpVariant} style={{ fontSize:"clamp(28px,4vw,46px)", fontWeight:800, letterSpacing:"-0.025em", color:"var(--ink)" }}>
                Built different by design
              </motion.h2>
            </div>

            <div className="features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap:24 }}>
              {features.map((f) => (
                <motion.div key={f.title}
                  variants={fadeUpVariant}
                  {...hoverProps}
                  className="feature-card"
                  style={{
                    background:"rgba(255,255,255,0.025)", border:"1px solid var(--line)",
                    borderRadius:"var(--radius-lg)", padding:"32px 28px",
                    transition:"border-color 0.2s, background 0.2s",
                    cursor: "default",
                  }}
                  whileHover={reducedMotion ? undefined : { y:-4, borderColor:"rgba(46,209,237,0.28)", background:"rgba(46,209,237,0.04)" } as never}
                >
                  <div style={{ fontSize:32, marginBottom:16 }}>{f.icon}</div>
                  <h3 style={{ fontSize:18, fontWeight:700, marginBottom:10, color:"var(--ink)" }}>{f.title}</h3>
                  <p style={{ fontSize:15, color:"var(--ink-soft)", lineHeight:1.65 }}>{f.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Demo wall ──────────────────────────────────────── */}
      <section id="demo-wall" style={{ padding:"clamp(64px,8vw,100px) 0", background:"var(--bg-2)", borderTop:"1px solid var(--line)" }}>
        <div className="container" style={{ textAlign:"center" }}>

          <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={defaultViewport}
            className="eyebrow" style={{ marginBottom:14 }}>
            One prompt. Any dashboard.
          </motion.div>
          <motion.h2 variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={defaultViewport}
            style={{ fontSize:"clamp(28px,4.5vw,56px)", fontWeight:800, letterSpacing:"-0.028em",
              maxWidth:640, margin:"0 auto 20px", lineHeight:1.08, color:"var(--ink)" }}>
            {outro?.headline
              ? outro.headline.replace("thirty-plus", "")
              : <>Falcon Finance is one of <span className="grad-text">thirty-plus.</span></>
            }
          </motion.h2>
          <motion.p variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={defaultViewport}
            style={{ fontSize:"clamp(15px,1.8vw,18px)", color:"var(--ink-soft)",
              maxWidth:520, margin:"0 auto 44px", lineHeight:1.65 }}>
            {outro?.subheadline ?? "Every demo on the wall started the same way — a single prompt. From credit analytics to supply chain, the same one-minute workflow."}
          </motion.p>

          {/* Compact 4-column card grid */}
          <motion.div
            ref={wallRef}
            variants={staggerFastContainer}
            initial="hidden"
            animate={wallInView ? "visible" : "hidden"}
            className="demo-wall-grid"
            style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
              gap:14,
              maxWidth:880,
              margin:"0 auto 28px",
            }}
          >
            {WALL_DEMOS.map((d) => (
              <motion.div key={d.slug} variants={fadeUpVariant}>
                <a
                  href={d.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wall-card"
                  style={{
                    display:"flex", flexDirection:"column", justifyContent:"center",
                    borderRadius:16, padding:"20px 18px",
                    textAlign:"left", textDecoration:"none",
                    background: d.featured
                      ? "rgba(46,209,237,0.06)"
                      : "rgba(255,255,255,0.03)",
                    border: d.featured
                      ? "1px solid rgba(46,209,237,0.45)"
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: d.featured
                      ? "0 0 28px rgba(46,209,237,0.14)"
                      : "none",
                    transition:"all 0.22s ease",
                    minHeight:100,
                  }}
                  onMouseEnter={e => {
                    if (reducedMotion) return;
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.transform = "translateY(-3px)";
                    el.style.background = d.featured
                      ? "rgba(46,209,237,0.10)"
                      : "rgba(46,209,237,0.05)";
                    el.style.borderColor = d.featured
                      ? "rgba(46,209,237,0.7)"
                      : "rgba(46,209,237,0.4)";
                    el.style.boxShadow = d.featured
                      ? "0 0 40px rgba(46,209,237,0.22)"
                      : "0 0 20px rgba(46,209,237,0.12)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.transform = "translateY(0)";
                    el.style.background = d.featured
                      ? "rgba(46,209,237,0.06)"
                      : "rgba(255,255,255,0.03)";
                    el.style.borderColor = d.featured
                      ? "rgba(46,209,237,0.45)"
                      : "rgba(255,255,255,0.08)";
                    el.style.boxShadow = d.featured
                      ? "0 0 28px rgba(46,209,237,0.14)"
                      : "none";
                  }}
                >
                  <div style={{ fontSize:15, fontWeight:700, color:"var(--ink)", marginBottom:5, lineHeight:1.25, letterSpacing:"-0.01em" }}>
                    {d.name}
                  </div>
                  <div style={{ fontSize:12, fontWeight:500, color:"var(--accent)", lineHeight:1.3 }}>
                    {d.tags.slice(0,2).join(" & ")}
                  </div>
                </a>
              </motion.div>
            ))}
          </motion.div>

          <motion.p variants={fadeUpVariant} initial="hidden" whileInView="visible"
            viewport={defaultViewport}
            style={{ fontSize:16, color:"var(--ink-mute)", marginBottom:52 }}>
            …and more at{" "}
            <Link href="/demos" style={{ color:"var(--accent)", fontFamily:"'SF Mono',ui-monospace,monospace", textDecoration:"none" }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration="underline")}
              onMouseLeave={e => (e.currentTarget.style.textDecoration="none")}>
              xFalcon.ai/demos
            </Link>
          </motion.p>

          {/* Final CTA block */}
          <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={defaultViewport}
            className="outro-cta"
            style={{
              display:"inline-flex", flexDirection:"column", alignItems:"center", gap:20,
              background:"rgba(46,209,237,0.06)", border:"1px solid rgba(46,209,237,0.20)",
              borderRadius:"var(--radius-lg)", padding:"44px 56px",
              maxWidth:540, width:"100%",
            }}>
            <h3 style={{ fontSize:"clamp(22px,3vw,30px)", fontWeight:800, letterSpacing:"-0.02em", color:"var(--ink)" }}>
              Ready to ship yours?
            </h3>
            <p style={{ fontSize:15, color:"var(--ink-soft)", maxWidth:360, lineHeight:1.65, textAlign:"center" }}>
              Schedule a demo and see how xFalcon transforms your analytics workflow.
            </p>
            <div className="outro-cta-btns" style={{ display:"flex", flexWrap:"wrap", gap:12, justifyContent:"center" }}>
              {/* Try xFalcon Free button — commented out for future use */}
              {/* <Link href={outro?.ctaPrimary?.href ?? "/signup"} className="btn-primary">
                {outro?.ctaPrimary?.label ?? "Try xFalcon free"}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link> */}
              <Link href={outro?.ctaSecondary?.href ?? "/contact"} className="btn-primary">
                {outro?.ctaSecondary?.label ?? "Book a Demo"}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      <style>{`
        /* Features: reduce padding on small cards */
        @media(max-width:639px){
          .feature-card { padding: 24px 20px !important; }
        }
        /* Demo wall: tighten gap on small screens */
        @media(max-width:479px){
          .demo-wall-grid { gap: 10px !important; }
          .wall-card { padding: 16px 14px !important; min-height: 88px !important; }
        }
        /* CTA block responsive */
        @media(max-width:767px){
          .outro-cta { padding: 32px 24px !important; }
          .outro-cta-btns { flex-direction: column !important; width: 100%; }
          .outro-cta-btns a { width: 100%; text-align: center; justify-content: center; }
        }
        @media(max-width:479px){
          .outro-cta { padding: 28px 20px !important; }
        }
      `}</style>
    </>
  );
}
