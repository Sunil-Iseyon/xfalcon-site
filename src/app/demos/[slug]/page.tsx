import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DEMOS, getDemoBySlug } from "@/data/demos";

export async function generateStaticParams() {
  return DEMOS.map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = getDemoBySlug(slug);
  if (!demo) return {};
  const title = `${demo.name} — xFalcon Analytics Demo`;
  return {
    title,
    description: demo.description,
    openGraph: {
      title,
      description: demo.description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description: demo.description,
      images: ["/og-image.png"],
    },
  };
}

export default async function DemoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = getDemoBySlug(slug);

  if (!demo) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <main style={{ paddingTop: 100 }}>
        <div className="container demo-detail-container">

          {/* Back link */}
          <Link href="/demos" className="back-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to all demos
          </Link>

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span style={{
                fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", padding: "5px 12px", borderRadius: 999,
                background: "var(--accent-dim)", color: "var(--accent)",
                border: "1px solid var(--accent-ring)",
              }}>
                {demo.industry}
              </span>
              {demo.featured && (
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", padding: "4px 10px", borderRadius: 999,
                  background: "rgba(46,209,237,0.15)", color: "var(--accent)",
                }}>
                  Featured
                </span>
              )}
            </div>

            <h1 style={{
              fontSize: "clamp(32px,4.5vw,52px)", fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 1.1,
              marginBottom: 20, color: "var(--ink)",
            }}>
              {demo.name}
            </h1>

            <p style={{
              fontSize: "clamp(15px,1.8vw,18px)", color: "var(--ink-soft)",
              lineHeight: 1.7, maxWidth: 680, marginBottom: 32,
            }}>
              {demo.description}
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <a href={demo.demoUrl} target="_blank" rel="noopener noreferrer"
                className="btn-primary">
                View live demo
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7H11.5M8 3.5L11.5 7L8 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <Link href="/contact" className="btn-outline">Book a custom demo</Link>
            </div>
          </div>

          {/* KPIs */}
          <div style={{
            background: "var(--panel)", border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)", padding: "32px",
            marginBottom: 40,
          }}>
            <h2 style={{
              fontSize: 14, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 24,
            }}>
              Key Metrics Tracked
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 16,
            }}>
              {demo.kpis.map((kpi, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", borderRadius: "var(--radius-sm)",
                  background: "var(--bg-soft)", border: "1px solid var(--line-2)",
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "var(--accent)", flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 14, color: "var(--ink-soft)", fontWeight: 500 }}>
                    {kpi}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{
              fontSize: 14, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 16,
            }}>
              Industries &amp; Topics
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {demo.tags.map(tag => (
                <span key={tag} style={{
                  padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500,
                  background: "var(--bg-soft)", color: "var(--ink-soft)",
                  border: "1px solid var(--line)",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA footer */}
          <div style={{
            background: "rgba(46,209,237,0.06)", border: "1px solid rgba(46,209,237,0.2)",
            borderRadius: "var(--radius-lg)", padding: "36px",
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between", gap: 24,
          }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "var(--ink)" }}>
                Want a custom build for your industry?
              </h3>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                Your first portal is free. Start with one prompt.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Link href="/signup" className="btn-primary">Get started free</Link>
              <Link href="/contact" className="btn-outline">Talk to us</Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />

      <style>{`
        .demo-detail-container {
          max-width: 860px;
          padding-top: 60px;
          padding-bottom: 120px;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--ink-mute);
          text-decoration: none;
          margin-bottom: 40px;
          transition: color 0.18s;
        }
        .back-link:hover { color: var(--accent); }
      `}</style>
    </div>
  );
}
