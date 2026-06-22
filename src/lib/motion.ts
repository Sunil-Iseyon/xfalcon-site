import type { Variants } from "framer-motion";

/* ─── Reusable animation variants ──────────────────────────────── */

export const fadeUpVariant: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeInVariant: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

export const scaleUpVariant: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const staggerFastContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
};

/* ─── Hover/tap presets (pass directly as motion props) ─────────── */

export const cardHover = {
  whileHover: { y: -4, scale: 1.01, transition: { duration: 0.2, ease: "easeOut" } },
  whileTap:   { scale: 0.98, transition: { duration: 0.1 } },
};

export const buttonHover = {
  whileHover: { scale: 1.02, transition: { duration: 0.18, ease: "easeOut" } },
  whileTap:   { scale: 0.97, transition: { duration: 0.08 } },
};

export const subtleHover = {
  whileHover: { y: -2, transition: { duration: 0.18, ease: "easeOut" } },
};

/* ─── Page transition (used in PageTransition wrapper) ──────────── */

export const pageVariants: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25, ease: "easeIn" } },
};

/* ─── Viewport config (shared across whileInView) ───────────────── */

export const defaultViewport = { once: true, margin: "-60px" } as const;
export const earlyViewport   = { once: true, margin: "-20px" } as const;

/* ─── Reduced-motion helpers ────────────────────────────────────── */

export function respectsMotion(variants: Variants, reducedMotion: boolean): Variants {
  if (!reducedMotion) return variants;
  return Object.fromEntries(
    Object.entries(variants).map(([key, val]) => [
      key,
      { ...(val as object), y: 0, scale: 1, x: 0 },
    ])
  );
}
