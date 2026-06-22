"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/* ── shared mini-styles ─────────────────────────────────────── */
const S = {
  tag: {
    display:"inline-flex", alignItems:"center", gap:6, alignSelf:"flex-start",
    background:"rgba(46,209,237,0.10)", border:"1px solid rgba(46,209,237,0.25)",
    borderRadius:8, padding:"5px 11px",
    fontFamily:"'SF Mono',ui-monospace,monospace", fontSize:11, fontWeight:600, color:"var(--accent)",
  } as React.CSSProperties,
  card: {
    background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
    borderRadius:12, padding:"12px 14px",
  } as React.CSSProperties,
};

/* ══════════════════════════════════════════════════════════════
   VIZ 0 — Prompt Composer
══════════════════════════════════════════════════════════════ */
export function VizPrompt() {
  return (
    <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:14 }}>
      {/* live indicator */}
      <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"var(--ink-mute)" }}>
        <span style={{ width:8, height:8, borderRadius:"50%", background:"var(--accent)",
          boxShadow:"0 0 10px var(--accent)", display:"inline-block", animation:"pulse-ring 2.2s ease-out infinite" }} />
        Claude · xFalcon workspace
      </div>

      {/* composer card */}
      <div style={{
        background:"rgba(8,15,30,0.95)", border:"1px solid rgba(46,209,237,0.30)",
        borderRadius:16, padding:"18px 18px 14px",
        boxShadow:"0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(46,209,237,0.08)",
      }}>
        <div style={{ fontFamily:"'SF Mono',ui-monospace,monospace", fontSize:13, lineHeight:1.6, color:"var(--ink)" }}>
          <span style={{ color:"var(--accent)", fontWeight:600, background:"rgba(46,209,237,0.12)",
            borderRadius:6, padding:"2px 8px", marginRight:6 }}>
            /xfalcon-dashboard
          </span>
          create a weekly business review dashboard for the C-level — focus on Last Week vs. same week last year.
          KPIs, trends, regional drill-downs, and an executive summary.
          <span style={{ display:"inline-block", width:2, height:"1em", background:"var(--accent)",
            marginLeft:3, transform:"translateY(3px)" }} className="animate-blink" />
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:16, flexWrap:"wrap", gap:10 }}>
          <span style={{ fontFamily:"'SF Mono',ui-monospace,monospace", fontSize:11, color:"var(--ink-mute)" }}>
            slash command · agent scaffolds &amp; builds
          </span>
          <span style={{
            background:"var(--accent)", color:"#040a17", borderRadius:9,
            padding:"7px 18px", fontSize:13, fontWeight:700,
          }} className="animate-sendpulse">
            Send ⏎
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   VIZ 1 — Agent Stream
══════════════════════════════════════════════════════════════ */
const STREAM_LINES = [
  { color:"var(--ink)",      bold:true,  text:"A few things before I build:" },
  { color:"var(--ink-soft)", bold:false, text:"•  Fiscal calendar — calendar weeks or 4-4-5?" },
  { color:"var(--ink-soft)", bold:false, text:"•  Segments — region, product, channel?" },
  { color:"var(--accent)",   bold:false, text:"❯ 4-4-5 · region + product · 364-day. Go." },
  { color:"#9ad0ff",         bold:false, text:"▸ Read   warehouse schema → 38 tables, 412 cols" },
  { color:"var(--green)",    bold:false, text:"✓ metrics.sql            7 KPIs · LW/LY deltas" },
  { color:"var(--green)",    bold:false, text:"✓ region_drilldown.tsx   by region · by product" },
];

export function VizStream() {
  const [vis, setVis] = useState(0);
  useEffect(() => { setVis(0); }, []);
  useEffect(() => {
    if (vis >= STREAM_LINES.length) return;
    const t = setTimeout(() => setVis(v => v + 1), 340);
    return () => clearTimeout(t);
  }, [vis]);

  return (
    <div style={{ width:"100%", fontFamily:"'SF Mono',ui-monospace,monospace",
      fontSize:13, lineHeight:1.4, display:"flex", flexDirection:"column", gap:9 }}>
      {STREAM_LINES.slice(0, vis).map((ln, i) => (
        <motion.div key={i}
          initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.22 }}
          style={{ color:ln.color, fontWeight:ln.bold ? 600 : 400,
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}
        >{ln.text}</motion.div>
      ))}
      {vis >= STREAM_LINES.length && (
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
          style={{ alignSelf:"flex-start", color:"var(--green)",
            background:"rgba(127,217,168,0.12)", border:"1px solid rgba(127,217,168,0.35)",
            borderRadius:9, padding:"8px 14px", fontWeight:700, marginTop:4 }}>
          ✓ Dashboard built — 7 KPIs · 4 charts · 10 modules
        </motion.div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   VIZ 2 — Dashboard Reveal
══════════════════════════════════════════════════════════════ */
const VOL = [1.4,1.3,1.6,1.5,1.7,1.6,1.5,1.7,1.6,1.8,1.7,1.9];
const MAX_VOL = Math.max(...VOL) / 0.85;

const KPIS = [
  { l:"Purchase Volume",  v:"$19.1M",  d:"−15.0% vs LY", dir:"dn" },
  { l:"Portfolio Balance",v:"$488.1M", d:"−14.9% vs LY", dir:"dn" },
  { l:"BNPL Orders",      v:"131,602", d:"−5.0%  vs LY", dir:"dn" },
  { l:"Net Charge-Offs",  v:"$23.2M",  d:"−5.3%  vs LY", dir:"up" },
];

export function VizDashboard() {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 120); return () => clearTimeout(t); }, []);

  return (
    <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:12 }}>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <b style={{ fontSize:18, fontWeight:700 }}>Falcon Finance</b>
          <span style={{ fontSize:12, color:"var(--accent)", fontWeight:500 }}>Credit &amp; BNPL Portal</span>
        </div>
        <div style={{ fontSize:11, color:"var(--ink-mute)", marginTop:3 }}>
          Weekly Business Review · LW vs. same week last year (364-day)
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {KPIS.map((k, i) => (
          <motion.div key={k.l}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
            style={{ ...S.card, display:"flex", flexDirection:"column", gap:3 }}>
            <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--ink-mute)", fontWeight:500 }}>{k.l}</span>
            <span style={{ fontFamily:"'SF Mono',ui-monospace,monospace", fontSize:20, fontWeight:700, lineHeight:1 }}>{k.v}</span>
            <span style={{ fontSize:11, fontWeight:500, color: k.dir==="up" ? "var(--green)" : "var(--red)" }}>{k.d}</span>
          </motion.div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ ...S.card, padding:"12px 14px" }}>
        <div style={{ fontSize:11, fontWeight:600, display:"flex", justifyContent:"space-between", marginBottom:10 }}>
          Monthly Purchase Volume
          <span style={{ fontSize:10, color:"var(--ink-mute)", fontWeight:400 }}>2025 vs 2024</span>
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:60 }}>
          {VOL.map((v, i) => {
            const cur = (v / MAX_VOL) * 100;
            const ly  = ((v / 0.85) / MAX_VOL) * 100;
            return (
              <div key={i} style={{ flex:1, display:"flex", justifyContent:"center", alignItems:"flex-end", gap:2, height:"100%" }}>
                <motion.span style={{ width:6, background:"rgba(255,255,255,0.15)", borderRadius:"3px 3px 0 0", display:"block" }}
                  initial={{ height:0 }} animate={{ height: go ? `${ly}%` : 0 }} transition={{ duration:0.5, delay:i*0.035 }} />
                <motion.span style={{ width:6, background:"var(--accent)", borderRadius:"3px 3px 0 0", display:"block",
                  boxShadow:"0 0 6px rgba(46,209,237,0.5)" }}
                  initial={{ height:0 }} animate={{ height: go ? `${cur}%` : 0 }} transition={{ duration:0.5, delay:i*0.035+0.1 }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   VIZ 3 — The Race
══════════════════════════════════════════════════════════════ */
const STEPS   = ["Prompt","Discover","Build","Live"];
const GANTT   = [
  { l:"Scoping & reqs",  pct:100, w:"2w", act:false },
  { l:"Data modeling",   pct:100, w:"3w", act:false },
  { l:"BI dev backlog",  pct:55,  w:"4w", act:true  },
  { l:"Review & rework", pct:0,   w:"3w", act:false },
];

export function VizRace() {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 220); return () => clearTimeout(t); }, []);

  return (
    <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:10 }}>

      {/* xFalcon lane */}
      <div style={{ background:"rgba(46,209,237,0.06)", border:"1px solid rgba(46,209,237,0.28)",
        borderRadius:14, padding:"14px 16px", display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <b style={{ fontSize:16, fontWeight:700 }}>xFalcon</b>
            <span style={{ fontSize:11, color:"var(--ink-mute)", display:"block", marginTop:2 }}>One prompt → live portal</span>
          </div>
          <div className="mono" style={{ fontSize:24, fontWeight:700, color:"var(--accent)", textAlign:"right", lineHeight:1 }}>
            00:47
            <small style={{ display:"block", fontFamily:"sans-serif", fontSize:10, fontWeight:400, color:"var(--ink-mute)", marginTop:3 }}>seconds</small>
          </div>
        </div>

        {/* track */}
        <div style={{ position:"relative", height:8, margin:"8px 4px 30px" }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(255,255,255,0.07)", borderRadius:999 }} />
          <motion.div style={{ position:"absolute", top:0, left:0, height:8, background:"var(--accent)",
            borderRadius:999, boxShadow:"0 0 14px rgba(46,209,237,0.5)" }}
            initial={{ width:0 }} animate={{ width: go ? "100%" : 0 }}
            transition={{ duration:1.2, ease:"easeOut" }} />
          {STEPS.map((s, i) => {
            const pct = (i / (STEPS.length - 1)) * 100;
            return (
              <div key={s} style={{ position:"absolute", top:"50%", left:`${pct}%`,
                transform:"translate(-50%,-50%)", display:"flex", flexDirection:"column", alignItems:"center" }}>
                <motion.span style={{ width:16, height:16, borderRadius:"50%",
                  background:"var(--accent)", border:"2px solid #040a17",
                  boxShadow:"0 0 10px var(--accent)", display:"block" }}
                  initial={{ scale:0 }} animate={{ scale: go ? 1 : 0 }}
                  transition={{ delay: 0.18 + i*0.24, type:"spring", stiffness:300 }} />
                <span style={{ position:"absolute", top:20, fontSize:10, fontWeight:600,
                  whiteSpace:"nowrap", color:"var(--ink-soft)" }}>{s}</span>
              </div>
            );
          })}
        </div>

        <div style={{ alignSelf:"flex-start", background:"rgba(46,209,237,0.12)",
          border:"1px solid rgba(46,209,237,0.4)", borderRadius:9,
          padding:"6px 14px", fontSize:12, fontWeight:700, color:"var(--accent)" }}>
          ✓ Live · same afternoon
        </div>
      </div>

      {/* Traditional BI lane */}
      <div style={{ ...S.card, display:"flex", flexDirection:"column", gap:10,
        border:"1px solid rgba(100,110,130,0.28)" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <b style={{ fontSize:16, fontWeight:700 }}>Traditional BI</b>
            <span style={{ fontSize:11, color:"var(--ink-mute)", display:"block", marginTop:2 }}>Tickets, hand-offs, backlog</span>
          </div>
          <div className="mono" style={{ fontSize:20, fontWeight:700, color:"var(--ink-mute)", textAlign:"right", lineHeight:1 }}>
            Wk 9
            <small style={{ display:"block", fontFamily:"sans-serif", fontSize:10, fontWeight:400, marginTop:3 }}>of ~12, still going</small>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {GANTT.map(row => (
            <div key={row.l} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ width:100, fontSize:11, color:"var(--ink-soft)", flexShrink:0 }}>{row.l}</span>
              <div style={{ flex:1, height:12, background:"rgba(255,255,255,0.05)", borderRadius:5, overflow:"hidden" }}>
                <motion.div style={{ height:"100%", borderRadius:5,
                  background: row.act ? "#6b7280" : "rgba(255,255,255,0.18)" }}
                  initial={{ width:0 }} animate={{ width: go ? `${row.pct}%` : 0 }}
                  transition={{ duration:0.7, delay:0.3 }} />
              </div>
              <span style={{ width:28, textAlign:"right", fontSize:11, color:"var(--ink-mute)", flexShrink:0 }}>{row.w}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:"var(--ink-mute)", fontStyle:"italic" }}>…dashboard not shipped yet.</p>
      </div>
    </div>
  );
}
