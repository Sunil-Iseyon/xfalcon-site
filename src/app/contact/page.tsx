"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <main style={{ paddingTop: 100 }}>
        <div className="container" style={{ maxWidth: 760, padding: "80px 24px 120px" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="eyebrow" style={{ marginBottom: 16 }}>Contact Us</div>
            <h1 style={{
              fontSize: "clamp(28px,4vw,52px)", fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 1.1,
              marginBottom: 20, color: "var(--ink)",
            }}>
              Get in Touch
            </h1>
            <p style={{ fontSize: 18, color: "var(--ink-soft)", lineHeight: 1.65, marginBottom: 56, maxWidth: 520 }}>
              Ready to see xFalcon in action? Schedule a personalized demo and discover how AI-native dashboards can transform your analytics workflow — in hours, not months.
            </p>

            {/* Contact info cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 56 }}>
              {/* Email */}
              <a
                href="mailto:info@iseyon.com"
                style={{
                  display: "flex", alignItems: "center", gap: 20,
                  background: "var(--panel)", border: "1px solid var(--line)",
                  borderRadius: "var(--radius-lg)", padding: "24px 28px",
                  textDecoration: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(46,209,237,0.4)";
                  e.currentTarget.style.boxShadow = "0 0 28px rgba(46,209,237,0.1)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--line)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: "rgba(46,209,237,0.1)", border: "1px solid rgba(46,209,237,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="var(--accent)" strokeWidth="1.5"/>
                    <path d="M2.5 7l7.5 5 7.5-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 5 }}>Email</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)" }}>info@iseyon.com</div>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:6515039126"
                style={{
                  display: "flex", alignItems: "center", gap: 20,
                  background: "var(--panel)", border: "1px solid var(--line)",
                  borderRadius: "var(--radius-lg)", padding: "24px 28px",
                  textDecoration: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(46,209,237,0.4)";
                  e.currentTarget.style.boxShadow = "0 0 28px rgba(46,209,237,0.1)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--line)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: "rgba(46,209,237,0.1)", border: "1px solid rgba(46,209,237,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M6.5 3H4.5A1.5 1.5 0 0 0 3 4.5C3 11.956 8.044 17 15.5 17a1.5 1.5 0 0 0 1.5-1.5v-2a1.5 1.5 0 0 0-1.5-1.5c-.76 0-1.508-.12-2.207-.345a1.5 1.5 0 0 0-1.5.375l-1.232 1.232A10.988 10.988 0 0 1 5.737 9.439L6.97 8.207a1.5 1.5 0 0 0 .374-1.5A8.975 8.975 0 0 1 7 4.5 1.5 1.5 0 0 0 5.5 3z" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 5 }}>Phone</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)" }}>651-503-9126</div>
                </div>
              </a>
            </div>

            <div style={{ textAlign: "left" }}>
              <a href="/demos" className="btn-primary" style={{ fontSize: 15 }}>
                Browse Demos
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/*
      ORIGINAL CONTACT FORM — Preserved for future use
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        First name / Last name fields...
      </div>
      Work email input...
      Company input...
      Message textarea...
      <button className="btn-primary">Send message</button>
      */}
    </div>
  );
}
