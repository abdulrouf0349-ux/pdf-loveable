import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UploadCard } from "@/components/upload-card";
import { ToolsGrid } from "@/components/tools-grid";
import { HowTo, ApiBanner } from "@/components/marketing-sections";
import { toolBySlug, tools } from "@/lib/tools";

export function generateStaticParams() {
  return tools.map((tool) => ({ tool: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params;
  const found = toolBySlug(tool);
  if (!found) {
    return {
      title: "Tool not found — Free PDF Convert",
      robots: { index: false },
    };
  }
  const title = `${found.headline} — Free & Online`;
  return {
    title,
    description: found.description,
    openGraph: {
      title,
      description: found.description,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const found = toolBySlug(tool);
  if (!found) notFound();

  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <UploadCard
        title={found.headline}
        subtitle={found.description}
        slug={found.slug}
      />
      <HowTo />
      <div className="bg-surface">
        <ToolsGrid heading="Other PDF Tools" />
      </div>
      <ApiBanner />
      <SiteFooter />
    </div>
  );
}
