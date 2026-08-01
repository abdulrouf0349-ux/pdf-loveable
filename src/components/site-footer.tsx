import { tools } from "@/lib/tools";

const columns: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Member area",
    links: [
      { label: "Sign In", to: "/sign-in" },
      { label: "Sign Up", to: "/sign-up" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    title: "Popular tools",
    links: tools.slice(10, 14).map((t) => ({ label: t.name, to: `/${t.slug}` })),
  },
  {
    title: "Developers",
    links: [
      { label: "API", to: "/api" },
      { label: "Documentation", to: "/docs" },
      { label: "Status", to: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Use", to: "/terms" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-5">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-[15px] font-bold text-ink">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.to} className="text-[15px] text-ink-muted hover:text-brand">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="lg:text-right">
          <p className="text-2xl font-bold text-brand">0 2 0 8 6 3 0 2 2 2 8 7</p>
          <p className="mt-2 text-sm text-ink-muted">Files converted so far</p>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-sm text-ink-muted">
        © {new Date().getFullYear()} freepdfconvert.com — All rights reserved.
      </div>
    </footer>
  );
}
