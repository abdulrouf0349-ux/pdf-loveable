import { Code as Code2, Trophy, ShieldCheck, Zap } from "lucide-react";

export function HowTo() {
  const steps = [
    {
      n: 1,
      title: "Upload",
      text: "Select the Word, Excel, PowerPoint, PDF or other file you wish to convert.",
    },
    {
      n: 2,
      title: "Start processing",
      text: "Our free PDF creator will convert your document to PDF or from PDF in seconds.",
    },
    {
      n: 3,
      title: "Download",
      text: "Your new document will be ready to download immediately. After the download is complete, any remaining files uploaded will be purged from our server.",
    },
  ];

  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-[1240px] px-5">
        <h2 className="text-center text-3xl font-bold tracking-tight text-ink">
          How to Convert Files to and from PDF Free
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n}>
              <div className="flex flex-col items-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-brand text-xl font-bold text-background">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{s.title}</h3>
              </div>
              <p className="mt-5 text-justify text-[15px] leading-relaxed text-ink-muted">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Features() {
  const items = [
    {
      icon: Trophy,
      title: "The best free PDF converter",
      text: "No matter which platform you use, our converter handles conversions to and from PDF for more than just Office documents. Registered members get access to our full conversion range and can upload several files at the same time.",
    },
    {
      icon: ShieldCheck,
      title: "Your files stay yours",
      text: "Uploads are encrypted in transit and deleted from our servers automatically once your download finishes. We never read, share or sell your documents.",
    },
    {
      icon: Zap,
      title: "Fast, accurate results",
      text: "Layouts, fonts, tables and images are preserved so the converted document looks exactly like the original — usually in just a few seconds.",
    },
  ];

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-16">
      <div className="grid gap-10 md:grid-cols-3">
        {items.map((f) => (
          <div key={f.title}>
            <f.icon className="size-8 text-ink" strokeWidth={1.6} />
            <h3 className="mt-4 text-lg font-bold text-ink">{f.title}</h3>
            <p className="mt-3 text-justify text-[15px] leading-relaxed text-ink-muted">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ApiBanner() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 pb-16">
      <div className="flex flex-col items-start gap-6 rounded-xl bg-surface px-8 py-8 md:flex-row md:items-center">
        <Code2 className="size-10 shrink-0 text-ink" strokeWidth={1.6} />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-ink">One API for all PDF conversions</h3>
          <p className="mt-2 text-[15px] text-ink-muted">
            Access a wide range of PDF conversion features in your app using a single ConvertAPI
            integration.
          </p>
        </div>
        <a
          href="/api"
          className="rounded-full bg-brand px-8 py-4 text-[15px] font-bold text-background transition-colors hover:bg-brand-hover"
        >
          Start building
        </a>
      </div>
    </section>
  );
}
