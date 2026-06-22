"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Your first portal is on us. No credit card required.",
    cta: "Get started free",
    ctaHref: "/signup",
    featured: false,
    features: [
      "1 analytics portal",
      "Up to 3 dashboards",
      "Snowflake / BigQuery connect",
      "xFalcon branding",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$299",
    period: "/mo",
    description: "For teams shipping multiple portals across one business unit.",
    cta: "Start free trial",
    ctaHref: "/signup",
    featured: true,
    features: [
      "Unlimited portals",
      "Unlimited dashboards",
      "All warehouse connectors",
      "Custom branding & domain",
      "Analytics & usage insights",
      "Priority email support",
      "Prompt history & versioning",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "White-glove onboarding, SLAs, and volume pricing for large teams.",
    cta: "Book a call",
    ctaHref: "/contact",
    featured: false,
    features: [
      "Everything in Pro",
      "SSO / SAML",
      "Dedicated implementation",
      "99.9% uptime SLA",
      "Custom contract & billing",
      "Security review & DPA",
      "Dedicated Slack channel",
    ],
  },
];

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay },
  };
}

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <main style={{ paddingTop: 100 }}>
        <section style={{ padding: "60px 0 100px", textAlign: "center" }}>
          <div className="container">
            <motion.div {...fadeUp(0)} className="eyebrow" style={{ marginBottom: 16 }}>
              Pricing
            </motion.div>
            <motion.h1 {...fadeUp(0.08)} style={{
              fontSize: "clamp(32px,5vw,62px)", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1.06,
              marginBottom: 20, color: "var(--ink)",
            }}>
              Start free.<br />
              <span className="grad-text">Scale when you ship.</span>
            </motion.h1>
            <motion.p {...fadeUp(0.14)} style={{
              fontSize: "clamp(15px,1.8vw,18px)", color: "var(--ink-soft)",
              maxWidth: 520, margin: "0 auto 72px", lineHeight: 1.65,
            }}>
              No seats, no dashboards limit drama. Pay for what you ship.
            </motion.p>

            {/* Plan cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24, maxWidth: 1000, margin: "0 auto",
            }}>
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  {...fadeUp(0.08 + i * 0.08)}
                  style={{
                    borderRadius: "var(--radius-lg)",
                    border: plan.featured ? "1px solid rgba(46,209,237,0.45)" : "1px solid var(--line)",
                    background: plan.featured ? "rgba(46,209,237,0.06)" : "var(--panel)",
                    padding: "36px 32px",
                    textAlign: "left",
                    position: "relative",
                    boxShadow: plan.featured ? "0 0 40px rgba(46,209,237,0.15)" : "none",
                  }}
                >
                  {plan.featured && (
                    <div style={{
                      position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                      background: "var(--accent)", color: "#040a17",
                      fontSize: 11, fontWeight: 800, letterSpacing: "0.1em",
                      textTransform: "uppercase", padding: "5px 16px",
                      borderRadius: "0 0 10px 10px",
                    }}>
                      Most Popular
                    </div>
                  )}

                  <div style={{ marginBottom: 8, marginTop: plan.featured ? 12 : 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-mute)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {plan.name}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 }}>
                    <span style={{ fontSize: "clamp(36px,4vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)" }}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span style={{ fontSize: 16, color: "var(--ink-mute)" }}>{plan.period}</span>
                    )}
                  </div>

                  <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 28 }}>
                    {plan.description}
                  </p>

                  <Link href={plan.ctaHref}
                    className={plan.featured ? "btn-primary" : "btn-outline"}
                    style={{ width: "100%", marginBottom: 28 }}
                  >
                    {plan.cta}
                  </Link>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                          <circle cx="8" cy="8" r="7" fill="rgba(46,209,237,0.15)"/>
                          <path d="M5 8l2.5 2.5L11 5.5" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* FAQ teaser */}
            <motion.div {...fadeUp(0.4)} style={{ marginTop: 80, color: "var(--ink-mute)", fontSize: 15 }}>
              Questions?{" "}
              <Link href="/contact" style={{ color: "var(--accent)", textDecoration: "none" }}>
                Talk to our team →
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
