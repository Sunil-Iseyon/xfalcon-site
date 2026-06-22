import StubPage from "@/components/StubPage";

export const metadata = { title: "Blog — xFalcon" };

export default function BlogPage() {
  return (
    <StubPage
      eyebrow="Blog"
      title="Stories from the data trenches."
      description="Deep dives on AI analytics, dashboard design patterns, and how teams are shipping faster with xFalcon. Coming soon."
      cta={{ label: "Get notified", href: "/signup" }}
    />
  );
}
