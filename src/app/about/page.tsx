import StubPage from "@/components/StubPage";

export const metadata = { title: "About — xFalcon" };

export default function AboutPage() {
  return (
    <StubPage
      eyebrow="About xFalcon"
      title="We're building the fastest path from data to decision."
      description="Our full story — mission, team, and investors — is coming soon. We're a small team obsessed with making analytics as fast as asking a question."
      cta={{ label: "See our demos", href: "/demos" }}
    />
  );
}
