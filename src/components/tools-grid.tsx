import Link from "next/link";
import { tools } from "@/lib/tools";

export function ToolsGrid({ heading }: { heading?: string }) {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-16">
      {heading && (
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-ink">{heading}</h2>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/${tool.slug}`}
            className={`flex flex-col items-center gap-4 rounded-xl bg-${tool.tint} px-3 py-7 transition-transform hover:-translate-y-0.5 hover:shadow-card`}
          >
            <span
              className={`flex size-12 items-center justify-center rounded-lg bg-${tool.accent}`}
            >
              <tool.icon className="size-6 text-background" strokeWidth={2.2} />
            </span>
            <span className="text-center text-[15px] text-ink">{tool.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
