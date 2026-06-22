import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  cta?: { label: string; href: string };
}

export default function StubPage({ eyebrow, title, description, cta }: Props) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 560, padding: "120px 24px 80px" }}>
          <div className="eyebrow" style={{ marginBottom: 20 }}>{eyebrow}</div>
          <h1 style={{
            fontSize: "clamp(32px,5vw,56px)", fontWeight: 800,
            letterSpacing: "-0.025em", lineHeight: 1.1,
            marginBottom: 20, color: "var(--ink)",
          }}>
            {title}
          </h1>
          <p style={{
            fontSize: "clamp(15px,1.8vw,18px)", color: "var(--ink-soft)",
            lineHeight: 1.65, marginBottom: cta ? 40 : 0,
          }}>
            {description}
          </p>
          {cta && (
            <Link href={cta.href} className="btn-primary">
              {cta.label}
            </Link>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
