import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ToolsGrid } from "@/components/tools-grid";
import { ApiBanner } from "@/components/marketing-sections";

export const metadata = {
  title: "All PDF Tools — Free PDF Convert",
  description:
    "Browse every free PDF tool: convert, merge, split, protect, unlock, compress, rotate, redact and flatten PDF files online.",
  openGraph: {
    title: "All PDF Tools — Free PDF Convert",
    description: "Every free online PDF tool in one place, no signup required.",
  },
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <div className="mx-auto max-w-[1240px] px-5 pt-14 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink">All PDF Tools</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink-muted">
          Pick a tool to convert, edit or secure your documents in seconds.
        </p>
      </div>
      <ToolsGrid />
      <ApiBanner />
      <SiteFooter />
    </div>
  );
}
