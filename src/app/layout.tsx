import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider }  from "@/components/ThemeProvider";
import PageTransition     from "@/components/PageTransition";

const SITE_URL = "https://xfalcon.ai";
const OG_IMAGE = "/og-image.png";
const DESCRIPTION =
  "Skip tickets, BI backlogs, and SQL. One slash command ships a live analytics portal the same afternoon.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "xFalcon — One Prompt. Any Dashboard.",
    template: "%s | xFalcon",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "xFalcon",
    title: "xFalcon — One Prompt. Any Dashboard.",
    description: DESCRIPTION,
    url: SITE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "xFalcon — One Prompt. Any Dashboard." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "xFalcon — One Prompt. Any Dashboard.",
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <ThemeProvider>
          <PageTransition>
            {children}
          </PageTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}
