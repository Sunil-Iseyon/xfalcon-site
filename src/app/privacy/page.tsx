import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = { title: "Privacy Policy — xFalcon" };

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <main style={{ paddingTop: 100 }}>
        <div className="container" style={{ maxWidth: 720, padding: "60px 24px 120px" }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Legal</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 12, color: "var(--ink)" }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-mute)", marginBottom: 48 }}>Last updated: January 2025</p>

          <div style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.8 }}>
            <p style={{ marginBottom: 24 }}>
              xFalcon (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This policy explains how we collect, use, and share information about you when you use our services.
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 12, marginTop: 40 }}>Information We Collect</h2>
            <p style={{ marginBottom: 16 }}>
              We collect information you provide directly (account details, prompts, feedback) and information generated automatically through your use of the service (usage data, analytics).
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 12, marginTop: 40 }}>How We Use Your Information</h2>
            <p style={{ marginBottom: 16 }}>
              We use collected information to operate and improve the platform, personalize your experience, and communicate with you about the service.
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 12, marginTop: 40 }}>Contact</h2>
            <p>
              Questions about this policy? Email us at <a href="mailto:privacy@xfalcon.ai" style={{ color: "var(--accent)" }}>privacy@xfalcon.ai</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
