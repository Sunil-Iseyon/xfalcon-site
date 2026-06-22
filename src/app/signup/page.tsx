// SIGNUP PAGE — Hidden from UI. Redirects to /contact. Code preserved below for future use.
import { redirect } from "next/navigation";
export default function SignupPage() { redirect("/contact"); }

/*
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignupPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <main style={{ paddingTop: 100, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ width: "100%", maxWidth: 480, padding: "60px 24px 80px", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="eyebrow" style={{ marginBottom: 16 }}>Get started free</div>
            <h1 style={{
              fontSize: "clamp(28px,4vw,42px)", fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 1.1,
              marginBottom: 16, color: "var(--ink)",
            }}>
              Ship your first portal<br />
              <span className="grad-text">in under an hour.</span>
            </h1>
            <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.65, marginBottom: 40 }}>
              No credit card required. Your first portal is completely free.
            </p>

            <div style={{
              background: "var(--panel)", border: "1px solid var(--line)",
              borderRadius: "var(--radius-lg)", padding: "32px",
              textAlign: "left",
            }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", display: "block", marginBottom: 8 }}>
                  Work email
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  style={{
                    width: "100%", padding: "12px 16px",
                    borderRadius: "var(--radius-sm)", border: "1px solid var(--line)",
                    background: "var(--bg-soft)", color: "var(--ink)",
                    fontSize: 15, outline: "none", transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={e => (e.target.style.borderColor = "var(--line)")}
                />
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", display: "block", marginBottom: 8 }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Choose a strong password"
                  style={{
                    width: "100%", padding: "12px 16px",
                    borderRadius: "var(--radius-sm)", border: "1px solid var(--line)",
                    background: "var(--bg-soft)", color: "var(--ink)",
                    fontSize: 15, outline: "none", transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={e => (e.target.style.borderColor = "var(--line)")}
                />
              </div>
              <button className="btn-primary" style={{ width: "100%", fontSize: 16 }}>
                Create free account
              </button>
            </div>

            <p style={{ marginTop: 24, fontSize: 13, color: "var(--ink-mute)" }}>
              Already have an account?{" "}
              <Link href="/signup" style={{ color: "var(--accent)", textDecoration: "none" }}>Sign in</Link>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
*/
