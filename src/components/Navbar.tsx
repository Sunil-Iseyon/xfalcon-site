"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import type { Navigation } from "@/lib/content";
import ThemeToggle from "./ThemeToggle";

const DEFAULT_LINKS = [
  // { label: "Product",  href: "/#why-xfalcon" },
  { label: "Demos",    href: "/demos" },
  // { label: "Pricing",  href: "/pricing" },
  // { label: "Docs",     href: "/docs" },
];

interface NavbarProps {
  content?: Navigation;
}

export default function Navbar({ content }: NavbarProps) {
  const links    = content?.links    ?? DEFAULT_LINKS;
  const ctaLabel = content?.ctaLabel ?? "Contact Us";
  const ctaHref  = content?.ctaHref  ?? "/contact";

  const { resolvedTheme } = useTheme();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted,    setMounted]    = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLight = mounted && resolvedTheme === "light";

  const scrolledBg     = isLight ? "rgba(248,250,252,0.92)" : "rgba(4,10,23,0.88)";
  const scrolledBorder = isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.06)";
  const linkColor      = isLight ? "#374151" : "var(--ink-soft)";
  const linkHover      = isLight ? "#111827" : "#ffffff";
  const brandTextColor = isLight ? "#111827" : "var(--ink)";
  const hamburgerColor = isLight ? "#374151" : "var(--ink-soft)";
  const drawerBg       = isLight ? "rgba(248,250,252,0.98)" : "var(--bg-2)";

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        transition: "background 0.4s, border-color 0.4s, backdrop-filter 0.4s",
        background: scrolled ? scrolledBg : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
        borderBottom: scrolled ? scrolledBorder : "1px solid transparent",
      }}
    >
      <div className="container" style={{ height: 72, display:"flex", alignItems:"center", justifyContent:"space-between" }}>

        {/* ── Logo ── */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:12, textDecoration:"none" }}>
          <Image
            src="/favicon_64.png"
            alt="xFalcon logo" width={36} height={36}
            style={{ objectFit:"contain" }} priority
          />
          <span style={{ fontSize:20, fontWeight:800, letterSpacing:"-0.03em", color: brandTextColor }}>
            x<span style={{ color:"var(--accent)" }}>Falcon</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav style={{ display:"flex", alignItems:"center", gap:36 }} className="hidden-mobile">
          {links.map(l => (
            <Link key={l.label} href={l.href}
              style={{ fontSize:14, fontWeight:500, color: linkColor, textDecoration:"none", transition:"color 0.18s" }}
              onMouseEnter={e => (e.currentTarget.style.color = linkHover)}
              onMouseLeave={e => (e.currentTarget.style.color = linkColor)}
            >{l.label}</Link>
          ))}
        </nav>

        {/* ── Desktop CTA + theme toggle ── */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }} className="hidden-mobile">
          <ThemeToggle />
          <Link href={ctaHref} className="btn-primary" style={{ padding:"10px 22px", fontSize:14 }}>
            {ctaLabel}
          </Link>
        </div>

        {/* ── Hamburger ── */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }} className="show-mobile">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            style={{
              background:"none", border:"none", cursor:"pointer",
              width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center",
              color: hamburgerColor,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {mobileOpen
                ? <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                : <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height:0, opacity:0 }}
            animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.28, ease:"easeInOut" }}
            style={{ overflow:"hidden", background: drawerBg, borderBottom:"1px solid var(--line)" }}
          >
            <div style={{ padding:"12px 24px 28px", display:"flex", flexDirection:"column" }}>
              {links.map(l => (
                <Link key={l.label} href={l.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontSize:16, fontWeight:500, color: linkColor, textDecoration:"none",
                    padding:"12px 0", borderBottom:"1px solid var(--line-2)",
                  }}
                >{l.label}</Link>
              ))}
              <div style={{ height:1, background:"var(--line)", margin:"16px 0 12px" }} />
              <Link href={ctaHref} className="btn-primary" style={{ textAlign:"center" }}
                onClick={() => setMobileOpen(false)}>
                {ctaLabel}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media(max-width:767px){ .hidden-mobile{display:none!important} .show-mobile{display:flex!important} }
        @media(min-width:768px){ .show-mobile{display:none!important} .hidden-mobile{display:flex!important} }
      `}</style>
    </motion.header>
  );
}
