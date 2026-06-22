import StubPage from "@/components/StubPage";

export const metadata = { title: "Careers — xFalcon" };

export default function CareersPage() {
  return (
    <StubPage
      eyebrow="Careers"
      title="Help us ship the future of analytics."
      description="We're a small, high-output team. Open roles will be posted here. If you're exceptional and obsessed with the problem, reach out directly."
      cta={{ label: "Send us a note", href: "/contact" }}
    />
  );
}
