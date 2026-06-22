import StubPage from "@/components/StubPage";

export const metadata = { title: "Press — xFalcon" };

export default function PressPage() {
  return (
    <StubPage
      eyebrow="Press"
      title="Press kit coming soon."
      description="Brand assets, executive bios, and media inquiries. Reach out directly for interviews or press coverage."
      cta={{ label: "Contact us", href: "/contact" }}
    />
  );
}
