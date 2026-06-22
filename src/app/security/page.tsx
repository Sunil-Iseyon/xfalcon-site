import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = { title: "Security — xFalcon" };

const ITEMS = [
  { icon: "🔒", title: "Data encryption", body: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256)." },
  { icon: "🛡️", title: "SOC 2 Type II", body: "We are pursuing SOC 2 Type II certification. Audit reports available on request." },
  { icon: "🔑", title: "Access controls", body: "Role-based access, single sign-on (SSO), and MFA support on all paid plans." },
  { icon: "🔍", title: "Vulnerability disclosure", body: "Responsible disclosure program. Report security issues to security@xfalcon.ai." },
];

export default function SecurityPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <main style={{ paddingTop: 100 }}>
        <div className="container" style={{ maxWidth: 860, padding: "60px 24px 120px" }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Trust & Security</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 20, color: "var(--ink)" }}>
            Security at xFalcon
          </h1>
          <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.7, maxWidth: 560, marginBottom: 64 }}>
            We take the security of your data seriously. Here&apos;s how we protect it.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 72 }}>
            {ITEMS.map(item => (
              <div key={item.title} style={{
                padding: "28px 24px", borderRadius: "var(--radius-lg)",
                background: "var(--panel)", border: "1px solid var(--line)",
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: "var(--ink)" }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>

          <div style={{
            background: "rgba(46,209,237,0.06)", border: "1px solid rgba(46,209,237,0.2)",
            borderRadius: "var(--radius-lg)", padding: "36px",
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "var(--ink)" }}>
              Report a vulnerability
            </h2>
            <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.65, marginBottom: 20 }}>
              If you&apos;ve found a security issue, please email{" "}
              <a href="mailto:security@xfalcon.ai" style={{ color: "var(--accent)" }}>security@xfalcon.ai</a>
              {" "}with a detailed description. We&apos;ll respond within 48 hours.
            </p>
            <Link href="/contact" className="btn-outline" style={{ fontSize: 14, padding: "10px 20px" }}>
              Contact security team
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
