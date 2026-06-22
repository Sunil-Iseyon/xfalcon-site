/* ─── xFalcon Design System ─────────────────────────────────────────
 * Single source of truth for all design tokens.
 * CSS variables are declared in globals.css (dark/light).
 * This file exports them as JS constants for use in TS/JSX.
 * ──────────────────────────────────────────────────────────────── */

/* ─── Brand ─────────────────────────────────────────────────────── */
export const ACCENT     = "#2ed1ed";
export const ACCENT_DIM = "rgba(46,209,237,0.10)";
export const ACCENT_RING = "rgba(46,209,237,0.22)";

/* ─── Dark palette ───────────────────────────────────────────────── */
export const dark = {
  bg:      "#040a17",
  bg2:     "#061122",
  bgSoft:  "#0d1828",
  panel:   "#080f1e",
  ink:     "#ffffff",
  inkSoft: "#b8c0cc",
  inkMute: "#5a6478",
  line:    "rgba(255,255,255,0.07)",
  line2:   "rgba(255,255,255,0.05)",
} as const;

/* ─── Light palette ──────────────────────────────────────────────── */
export const light = {
  bg:      "#f8fafc",
  bg2:     "#f1f5f9",
  bgSoft:  "#e2e8f0",
  panel:   "#ffffff",
  ink:     "#0d1828",
  inkSoft: "#334155",
  inkMute: "#64748b",
  line:    "rgba(13,24,40,0.08)",
  line2:   "rgba(13,24,40,0.05)",
} as const;

/* ─── Typography scale ───────────────────────────────────────────── */
export const type = {
  display:  { size: "clamp(40px,6.5vw,82px)",  weight: 800, tracking: "-0.03em",  leading: 1.04 },
  h1:       { size: "clamp(32px,5vw,62px)",    weight: 800, tracking: "-0.028em", leading: 1.06 },
  h2:       { size: "clamp(28px,4vw,48px)",    weight: 800, tracking: "-0.025em", leading: 1.1  },
  h3:       { size: "clamp(22px,2.5vw,32px)",  weight: 700, tracking: "-0.02em",  leading: 1.2  },
  h4:       { size: "18px",                    weight: 700, tracking: "-0.01em",  leading: 1.3  },
  bodyLg:   { size: "clamp(15px,1.8vw,18px)",  weight: 400, tracking: "0",        leading: 1.65 },
  body:     { size: "16px",                    weight: 400, tracking: "0",        leading: 1.65 },
  bodySm:   { size: "14px",                    weight: 400, tracking: "0",        leading: 1.6  },
  caption:  { size: "13px",                    weight: 500, tracking: "0.02em",   leading: 1.5  },
  eyebrow:  { size: "11px",                    weight: 700, tracking: "0.22em",   leading: 1    },
  code:     { size: "13px",                    weight: 400, tracking: "0",        leading: 1.6  },
} as const;

/* ─── Font stacks ────────────────────────────────────────────────── */
export const fonts = {
  sans: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif",
  mono: "'SF Mono', 'Geist Mono', ui-monospace, Menlo, Monaco, Consolas, monospace",
} as const;

/* ─── Spacing scale (4px base) ──────────────────────────────────── */
export const space = {
  "1":  4,   "2":  8,   "3":  12,  "4":  16,  "5":  20,
  "6":  24,  "8":  32,  "10": 40,  "12": 48,  "14": 56,
  "16": 64,  "20": 80,  "24": 96,  "28": 112, "32": 128,
} as const;

/* ─── Border radius scale ────────────────────────────────────────── */
export const radius = {
  sm:   "10px",
  md:   "16px",
  lg:   "22px",
  full: "9999px",
} as const;

/* ─── Shadow presets ─────────────────────────────────────────────── */
export const shadows = {
  panel:  "0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(46,209,237,0.12)",
  card:   "0 4px 24px rgba(0,0,0,0.3)",
  glow:   "0 0 32px rgba(46,209,237,0.18)",
  button: "0 8px 28px rgba(46,209,237,0.35)",
} as const;

/* ─── Animation durations ────────────────────────────────────────── */
export const duration = {
  fast:   0.18,
  normal: 0.28,
  slow:   0.45,
  page:   0.4,
} as const;

/* ─── Easing presets ─────────────────────────────────────────────── */
export const ease = {
  out:    [0.22, 1, 0.36, 1] as [number,number,number,number],
  in:     "easeIn"  as const,
  inOut:  "easeInOut" as const,
  spring: { type: "spring", stiffness: 300, damping: 30 },
} as const;

/* ─── Breakpoints ────────────────────────────────────────────────── */
export const bp = {
  mobile:  "640px",
  tablet:  "768px",
  desktop: "900px",
  wide:    "1140px",
} as const;

/* ─── Z-index scale ──────────────────────────────────────────────── */
export const z = {
  base:    0,
  card:    1,
  sticky:  10,
  overlay: 50,
  nav:     100,
  modal:   200,
  toast:   300,
} as const;
