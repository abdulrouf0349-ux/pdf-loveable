"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Cloud, HardDrive, Link2, FileText, X, Download, Loader as Loader2 } from "lucide-react";
import { getConverter } from "@/lib/converters";
import { toolBySlug } from "@/lib/tools";

export function UploadCard({
  title,
  subtitle,
  slug,
}: {
  title: string;
  subtitle: string;
  slug?: string;
}) {
  const tool = slug ? toolBySlug(slug) : undefined;
  const Icon = tool?.icon ?? FileText;
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);

  const converter = getConverter(slug);
  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  function clearResult() {
    setError(null);
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
  }

  function selectFiles(next: File[]) {
    setFiles(converter?.multiple ? (prev) => [...prev, ...next] : next);
    clearResult();
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    clearResult();
  }

  async function convert() {
    if (!files.length || !converter) return;
    setBusy(true);
    setError(null);
    try {
      const { blob, filename } = await converter.run(files);
      setResult({ url: URL.createObjectURL(blob), filename });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed. Please try another file.");
    } finally {
      setBusy(false);
    }
  }

  const chooseLabel = converter?.multiple ? "Choose files" : "Choose file";

  return (
    <section className="mx-auto max-w-[1240px] px-5 pt-10 pb-16">
      <div className="rounded-2xl bg-background p-3 shadow-card">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const dropped = Array.from(e.dataTransfer.files ?? []);
            if (dropped.length) selectFiles(converter?.multiple ? dropped : dropped.slice(0, 1));
          }}
          className={`rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
            dragging ? "border-brand bg-tint-red" : "border-brand/35"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-brand">
              <Icon className="size-5 text-background" strokeWidth={2.4} />
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-ink">{title}</h1>
          </div>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-muted">{subtitle}</p>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple={converter?.multiple ?? false}
            {...(converter ? { accept: converter.accept } : {})}
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              if (picked.length) selectFiles(picked);
              e.target.value = "";
            }}
          />

          {result ? (
            <a
              href={result.url}
              download={result.filename}
              className="mx-auto mt-12 flex w-full max-w-[600px] items-center justify-center gap-3 rounded-full bg-brand py-5 text-lg font-bold text-background transition-colors hover:bg-brand-hover"
            >
              <Download className="size-5" strokeWidth={3} />
              Download {result.filename}
            </a>
          ) : files.length > 0 && converter ? (
            <button
              type="button"
              disabled={busy}
              onClick={convert}
              className="mx-auto mt-12 flex w-full max-w-[600px] items-center justify-center gap-3 rounded-full bg-brand py-5 text-lg font-bold text-background transition-colors hover:bg-brand-hover disabled:opacity-70"
            >
              {busy ? <Loader2 className="size-5 animate-spin" strokeWidth={3} /> : null}
              {busy ? "Converting…" : "Convert now"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mx-auto mt-12 flex w-full max-w-[600px] items-center justify-center gap-3 rounded-full bg-brand py-5 text-lg font-bold text-background transition-colors hover:bg-brand-hover"
            >
              <Plus className="size-5" strokeWidth={3} />
              {chooseLabel}
            </button>
          )}

          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="mx-auto mt-3 flex w-full max-w-[600px] items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-left"
            >
              <span className="truncate text-[15px] text-ink">{file.name}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeFile(index)}
                className="text-ink-muted hover:text-brand"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}

          {files.length > 0 && converter?.multiple && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mx-auto mt-4 flex items-center gap-2 text-[15px] font-semibold text-brand hover:underline"
            >
              <Plus className="size-4" strokeWidth={3} />
              Add more files
            </button>
          )}

          {error && (
            <p role="alert" className="mx-auto mt-4 max-w-[600px] text-sm font-medium text-brand">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-center gap-4">
            {[Cloud, HardDrive, Link2].map((Sub, i) => (
              <button
                key={i}
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex size-11 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:border-brand hover:text-brand"
              >
                <Sub className="size-5" />
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-muted">
            {converter
              ? "Conversion runs entirely in your browser — your file never leaves your device."
              : "Files stay private and are purged from our servers after download."}
          </p>
        </div>
      </div>
    </section>
  );
}
