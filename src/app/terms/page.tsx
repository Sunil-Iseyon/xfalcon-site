import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = { title: "Terms of Service — xFalcon" };

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <main style={{ paddingTop: 100 }}>
        <div className="container" style={{ maxWidth: 720, padding: "60px 24px 120px" }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Legal</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 12, color: "var(--ink)" }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-mute)", marginBottom: 48 }}>Last updated: January 2025</p>

          <div style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.8 }}>
            <p style={{ marginBottom: 24 }}>
              By using xFalcon, you agree to these terms. Please read them carefully.
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 12, marginTop: 40 }}>Use of Service</h2>
            <p style={{ marginBottom: 16 }}>
              You may use xFalcon only in compliance with these terms and all applicable laws. You must not misuse our services or help anyone else do so.
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 12, marginTop: 40 }}>Your Content</h2>
            <p style={{ marginBottom: 16 }}>
              You retain ownership of content you submit. By submitting content, you grant us a license to use it to provide and improve our services.
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 12, marginTop: 40 }}>Contact</h2>
            <p>
              Questions? Email us at <a href="mailto:legal@xfalcon.ai" style={{ color: "var(--accent)" }}>legal@xfalcon.ai</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
