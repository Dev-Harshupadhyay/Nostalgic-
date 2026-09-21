import type { Metadata } from "next";
import ChhathIntro from "@/components/chhath/ChhathIntro";
import ChhathSection from "@/components/chhath/ChhathSection";
import SupportCard from "@/components/support/SupportCard";
import { songsByCategory, getGroup } from "@/lib/catalog";

const DESC =
  "Chhath Puja — Bihar ka mahaparv. Chhath geet, traditional songs, bhajan aur char din ki poori parampara: Nahay Khay, Kharna, Sandhya Argh aur Usha Argh.";

export const metadata: Metadata = {
  title: "Chhath Puja — Bihar ka Mahaparv, Chhath Geet & Bhajan",
  description: DESC,
  alternates: { canonical: "/chhath" },
  keywords: [
    "chhath puja",
    "chhath geet",
    "bihar chhath",
    "sharda sinha chhath",
    "nahay khay kharna",
    "chhathi maiya",
    "usha argh",
  ],
  openGraph: {
    title: "Chhath Puja — Bihar ka Mahaparv, Chhath Geet & Bhajan",
    description: DESC,
    url: "/chhath",
  },
};

export default function Page() {
  const buckets = songsByCategory("chhathPuja");
  const total = getGroup("chhathPuja").length;

  return (
    <div className="eg-scope ch-scope mx-auto max-w-[1400px] px-4 sm:px-6">
      <ChhathIntro count={total} />

      <div className="mt-12 pb-6">
        <ChhathSection buckets={buckets} />
      </div>

      <div className="pb-4">
        <SupportCard compact />
      </div>
    </div>
  );
}
