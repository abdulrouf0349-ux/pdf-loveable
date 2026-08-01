import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UploadCard } from "@/components/upload-card";
import { ToolsGrid } from "@/components/tools-grid";
import { HowTo, Features, ApiBanner } from "@/components/marketing-sections";

export const metadata = {
  title: "Free PDF Converter — Convert to and from PDF Online",
  description:
    "Convert Word, Excel, PowerPoint, JPG and more to PDF — or PDF back to editable files. Free, fast and private online PDF converter.",
  openGraph: {
    title: "Free PDF Converter — Convert to and from PDF Online",
    description: "Easily convert to and from PDF in seconds with 29 free online PDF tools.",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <UploadCard title="Online PDF Converter" subtitle="Easily convert to and from PDF in seconds." />
      <HowTo />
      <Features />
      <div className="bg-surface">
        <ToolsGrid heading="All PDF Tools" />
      </div>
      <ApiBanner />
      <SiteFooter />
    </div>
  );
}
