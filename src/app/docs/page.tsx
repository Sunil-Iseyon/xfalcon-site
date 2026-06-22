import StubPage from "@/components/StubPage";

export const metadata = { title: "Docs — xFalcon", description: "xFalcon developer documentation." };

export default function DocsPage() {
  return (
    <StubPage
      eyebrow="Documentation"
      title="Docs are on their way."
      description="Full API references, integration guides, and quickstart tutorials are coming soon. In the meantime, reach out and we'll walk you through anything you need."
      cta={{ label: "Contact us", href: "/contact" }}
    />
  );
}
