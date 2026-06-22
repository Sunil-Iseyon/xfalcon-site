"use client";

import Image from "next/image";
import Link from "next/link";
import type { FooterContent } from "@/lib/content";

interface FooterProps {
  content?: FooterContent;
}

const DEFAULT_CONTENT: FooterContent = {
  tagline: "One prompt to a live analytics portal. Ship dashboards, not tickets.",
  copyright: "© 2025 xFalcon. All rights reserved.",
  linkGroups: [
    { title: "Product", links: [
      { label: "Features",  href: "/#why-xfalcon" },
      { label: "Demos",     href: "/demos" },
      // { label: "Pricing",   href: "/pricing" },
      // { label: "Changelog", href: "/changelog" },
    ]},
    // COMPANY COLUMN — Commented out for future use
    // { title: "Company", links: [
    //   { label: "About",   href: "/about" },
    //   { label: "Blog",    href: "/blog" },
    //   { label: "Careers", href: "/careers" },
    //   { label: "Press",   href: "/press" },
    // ]},
    { title: "Legal", links: [
      { label: "Privacy",  href: "/privacy" },
      { label: "Terms",    href: "/terms" },
      { label: "Security", href: "/security" },
    ]},
  ],
  // Social links — commented out for future use
  // socialLinks: [
  //   { label: "Twitter/X", href: "https://twitter.com/xFalconAI" },
  //   { label: "LinkedIn",  href: "https://linkedin.com/company/xfalcon" },
  //   { label: "GitHub",    href: "https://github.com/xfalcon-ai" },
  // ],
  socialLinks: [],
};

export default function Footer({ content }: FooterProps) {
  const c = content ?? DEFAULT_CONTENT;

  return (
    <footer style={{ borderTop:"1px solid var(--line)", padding:"64px 0 40px", background:"var(--bg-2)" }}>
      <div className="container">
        <div className="footer-grid" style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
          gap:40, marginBottom:56,
        }}>
          {/* Brand col */}
          <div style={{ gridColumn:"span 2", minWidth:200 }} className="footer-brand">
            <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:10, textDecoration:"none", marginBottom:16 }}>
              <Image src="/favicon_64.png" alt="xFalcon" width={28} height={28} style={{ objectFit:"contain" }} />
              <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.03em", color:"var(--ink)" }}>
                x<span style={{ color:"var(--accent)" }}>Falcon</span>
              </span>
            </Link>
            <p style={{ fontSize:14, color:"var(--ink-mute)", maxWidth:220, lineHeight:1.65, marginBottom:16 }}>
              {c.tagline}
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <a href="mailto:info@iseyon.com" style={{ fontSize:13, color:"var(--ink-soft)", textDecoration:"none", display:"flex", alignItems:"center", gap:8, transition:"color 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-soft)")}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0 }}>
                  <rect x="1" y="2.5" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M1 5l6 4 6-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                info@iseyon.com
              </a>
              <a href="tel:6515039126" style={{ fontSize:13, color:"var(--ink-soft)", textDecoration:"none", display:"flex", alignItems:"center", gap:8, transition:"color 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-soft)")}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0 }}>
                  <path d="M4.5 2H3a1 1 0 0 0-1 1C2 8.523 5.477 12 10 12a1 1 0 0 0 1-1v-1.5a1 1 0 0 0-1-1 6.4 6.4 0 0 1-1.5-.233 1 1 0 0 0-1 .25L6.67 9.356A7.33 7.33 0 0 1 4.644 7.33L5.483 6.5a1 1 0 0 0 .25-1A6.4 6.4 0 0 1 5.5 4a1 1 0 0 0-1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                651-503-9126
              </a>
            </div>
          </div>

          {/* Link cols */}
          {c.linkGroups.map((group) => (
            <div key={group.title}>
              <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
                color:"var(--ink-mute)", marginBottom:16 }}>{group.title}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {group.links.map(item => (
                  <Link key={item.label} href={item.href}
                    style={{ fontSize:14, color:"var(--ink-soft)", textDecoration:"none", transition:"color 0.18s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-soft)")}
                  >{item.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="footer-bottom" style={{ borderTop:"1px solid var(--line)", paddingTop:28,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:13, color:"var(--ink-mute)", textAlign:"center" }}>{c.copyright}</span>
          {/* Social links — commented out for future use */}
          {/* <div style={{ display:"flex", gap:20 }}>
            {c.socialLinks.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:13, color:"var(--ink-mute)", textDecoration:"none", transition:"color 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-mute)")}
              >{s.label}</a>
            ))}
          </div> */}
        </div>
      </div>

      <style>{`
        @media(max-width:479px){
          /* Brand: full width single column */
          .footer-brand { grid-column: 1 / -1 !important; min-width: unset !important; }
          /* Link groups: 2-column grid */
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          .footer-bottom { text-align: center; }
        }
        @media(min-width:480px) and (max-width:767px){
          .footer-brand { grid-column: span 2 !important; }
          .footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </footer>
  );
}
