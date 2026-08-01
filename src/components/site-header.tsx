import Link from "next/link";
import { Grip, FileText } from "lucide-react";
import { navTools } from "@/lib/tools";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center gap-6 px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-brand">
            <FileText className="size-5 text-background" strokeWidth={2.4} />
          </span>
          <span className="text-xl font-bold tracking-tight text-ink">PDF Converter</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          <Link
            href="/tools"
            className="mr-2 flex items-center gap-2 px-2 text-[15px] text-ink-muted hover:text-ink"
          >
            <Grip className="size-4" />
            All Tools
          </Link>
          <span className="mr-2 h-6 w-px bg-border" />
          {navTools.map((t) => (
            <Link
              key={t.slug}
              href={`/${t.slug}`}
              className="rounded-md px-2.5 py-1.5 text-[15px] text-ink-muted transition-colors hover:text-brand"
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/sign-in" className="text-[15px] text-ink-muted hover:text-ink">
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-brand px-6 py-2.5 text-[15px] font-bold text-background transition-colors hover:bg-brand-hover"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
