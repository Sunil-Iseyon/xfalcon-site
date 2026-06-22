"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DEMOS, ALL_INDUSTRIES } from "@/data/demos";

function DemoCard({ demo, index }: { demo: typeof DEMOS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      whileHover={{ y: -4 } as never}
      style={{
        borderRadius: "var(--radius-lg)",
        border: demo.featured
          ? "1px solid rgba(46,209,237,0.4)"
          : "1px solid var(--line)",
        background: demo.featured
          ? "rgba(46,209,237,0.05)"
          : "var(--panel)",
        boxShadow: demo.featured
          ? "0 0 32px rgba(46,209,237,0.12)"
          : "var(--shadow-panel)",
        overflow: "hidden",
        transition: "box-shadow 0.2s, border-color 0.2s",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          demo.featured
            ? "0 0 48px rgba(46,209,237,0.22)"
            : "0 8px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(46,209,237,0.15)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          demo.featured
            ? "0 0 32px rgba(46,209,237,0.12)"
            : "var(--shadow-panel)";
      }}
    >
      <div style={{ padding: "24px 24px 20px", flex: 1 }}>
        {/* Industry badge */}
        <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", padding: "4px 10px", borderRadius: 999,
            background: demo.featured ? "rgba(46,209,237,0.15)" : "var(--bg-soft)",
            color: demo.featured ? "var(--accent)" : "var(--ink-mute)",
            border: "1px solid var(--line)",
          }}>
            {demo.industry}
          </span>
          {demo.featured && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", padding: "3px 8px", borderRadius: 999,
              background: "rgba(46,209,237,0.2)", color: "var(--accent)",
            }}>
              Featured
            </span>
          )}
        </div>

        {/* Name */}
        <h3 style={{
          fontSize: 18, fontWeight: 700, marginBottom: 10,
          letterSpacing: "-0.01em", color: "var(--ink)",
        }}>
          {demo.name}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.65,
          marginBottom: 16,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        } as React.CSSProperties}>
          {demo.description}
        </p>

        {/* KPI count — hidden for now, preserved for future use */}
        {/* <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 8 }}>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>{demo.kpis.length}</span>
          {" "}key metrics tracked
        </div> */}

        {/* Tags — hidden for now, preserved for future use */}
        {/* <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {demo.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 999,
              background: "var(--bg-soft)", color: "var(--ink-mute)",
              border: "1px solid var(--line-2)",
            }}>
              {tag}
            </span>
          ))}
        </div> */}
      </div>

      {/* Footer link */}
      <div style={{
        padding: "16px 24px",
        borderTop: "1px solid var(--line)",
        display: "flex", alignItems: "center", justifyContent: "flex-end",
      }}>
        {/* Footer metadata — hidden for now, preserved for future use */}
        {/* <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>
          {demo.kpis.slice(0, 2).join(" · ")}
        </span> */}
        <a href={demo.demoUrl} target="_blank" rel="noopener noreferrer" style={{
          fontSize: 13, fontWeight: 600, color: "var(--accent)",
          textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
          transition: "gap 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.gap = "8px")}
          onMouseLeave={e => (e.currentTarget.style.gap = "4px")}
        >
          View demo →
        </a>
      </div>
    </motion.div>
  );
}

export default function DemosClient() {
  const [activeIndustry, setActiveIndustry] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return DEMOS.filter(d => {
      const matchIndustry = activeIndustry === "All" || d.industry === activeIndustry;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.industry.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q));
      return matchIndustry && matchSearch;
    });
  }, [activeIndustry, search]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <main style={{ paddingTop: 100 }}>
        {/* Header */}
        <section style={{ padding: "60px 0 48px", textAlign: "center" }}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="eyebrow" style={{ marginBottom: 16 }}
            >
              Live Demo Portals
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              style={{
                fontSize: "clamp(32px,5vw,62px)", fontWeight: 800,
                letterSpacing: "-0.03em", lineHeight: 1.06,
                marginBottom: 20, color: "var(--ink)",
              }}
            >
              30+ industry demos,<br />
              <span className="grad-text">one prompt each.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14 }}
              style={{
                fontSize: "clamp(15px,1.8vw,18px)", color: "var(--ink-soft)",
                maxWidth: 520, margin: "0 auto", lineHeight: 1.65,
              }}
            >
              Every portal below was generated from a single slash command.
              Browse by industry or explore them all.
            </motion.p>
          </div>
        </section>

        {/* Filters */}
        <section style={{ padding: "0 0 40px", position: "sticky", top: 72, zIndex: 10,
          background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
          <div className="container">
            {/* Search */}
            <div style={{ marginBottom: 16, position: "relative" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-mute)", pointerEvents: "none" }}>
                <path d="M11 11L14 14M12.5 7A5.5 5.5 0 1 1 1.5 7a5.5 5.5 0 0 1 11 0z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="search"
                placeholder="Search demos by name, industry, or tag…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px 12px 40px",
                  borderRadius: "var(--input-radius)", border: "1px solid var(--line)",
                  background: "var(--panel)", color: "var(--ink)",
                  fontSize: 14, outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                onBlur={e => (e.target.style.borderColor = "var(--line)")}
              />
            </div>

            {/* Industry pills — horizontal scroll on mobile */}
            <div className="demos-filters" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {ALL_INDUSTRIES.map(ind => (
                <button
                  key={ind}
                  onClick={() => setActiveIndustry(ind)}
                  style={{
                    padding: "7px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.18s", flexShrink: 0,
                    border: activeIndustry === ind ? "1px solid var(--accent)" : "1px solid var(--line)",
                    background: activeIndustry === ind ? "rgba(46,209,237,0.12)" : "transparent",
                    color: activeIndustry === ind ? "var(--accent)" : "var(--ink-mute)",
                  }}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section style={{ padding: "48px 0 120px" }}>
          <div className="container">
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-mute)", fontSize: 16 }}>
                No demos match &ldquo;{search}&rdquo;. Try a different search.
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 32 }}>
                  Showing <strong style={{ color: "var(--ink)" }}>{filtered.length}</strong> of {DEMOS.length} demos
                </p>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 24,
                }}>
                  {filtered.map((demo, i) => (
                    <DemoCard key={demo.slug} demo={demo} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        .demos-filters::-webkit-scrollbar { display: none; }
        .demos-filters { -ms-overflow-style: none; scrollbar-width: none; }
        @media(max-width:479px){
          input[type="search"]::placeholder { font-size: 13px; }
        }
        @media(max-width:767px){
          /* single column on small tablets */
          .demos-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
