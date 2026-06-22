import type { Metadata } from "next";
import DemosClient from "./DemosClient";

export const metadata: Metadata = {
  title: "xFalcon Demos — 30+ Industry Analytics Portals",
  description:
    "Every portal was generated from a single slash command. Browse 30+ industry analytics demo portals — finance, healthcare, retail, and more.",
  openGraph: {
    title: "xFalcon Demos — 30+ Industry Analytics Portals",
    description:
      "Every portal was generated from a single slash command. Browse 30+ industry analytics demos built by xFalcon.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "xFalcon Demos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "xFalcon Demos — 30+ Industry Analytics Portals",
    description:
      "Every portal was generated from a single slash command. Browse 30+ industry analytics demos.",
    images: ["/og-image.png"],
  },
};

export default function DemosPage() {
  return <DemosClient />;
}
