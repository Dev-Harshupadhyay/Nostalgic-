import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import DeveloperDashboard from "@/components/dev/DeveloperDashboard";
import SupportCard from "@/components/support/SupportCard";
import { DEV } from "@/lib/site";

export const metadata: Metadata = {
  title: "Harsh Dev — About the Developer",
  description:
    "Harsh Dev — creator and developer behind Nostalgic Music Player. Portfolio, projects and ways to support the work.",
  alternates: { canonical: "/developer" },
  openGraph: {
    title: "Harsh Dev — About the Developer",
    description: "Creator & developer behind this music experience.",
    url: "/developer",
  },
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: DEV.fullName,
  alternateName: DEV.name,
  jobTitle: DEV.role,
  knowsAbout: ["Web Development", "UI/UX", "Music Projects"],
  url: DEV.portfolio,
  sameAs: [DEV.portfolio, DEV.timepass],
};

export default function DeveloperPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 pb-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <PageHeader
        eyebrow="Built by Harsh"
        title="Harsh Dev"
        emoji="🛠️"
        description="Creator & developer behind this music experience."
      />
      <DeveloperDashboard />
      <SupportCard compact />
    </div>
  );
}
