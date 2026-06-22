import StubPage from "@/components/StubPage";

export const metadata = { title: "Changelog — xFalcon" };

export default function ChangelogPage() {
  return (
    <StubPage
      eyebrow="Changelog"
      title="Release notes coming soon."
      description="We ship fast. A full changelog tracking every update, fix, and new feature is launching shortly."
      cta={{ label: "Follow us on X", href: "https://twitter.com/xFalconAI" }}
    />
  );
}
