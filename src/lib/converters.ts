// Client-side conversion pipeline. Each converter is registered per tool slug and
// lazily imports its heavy npm dependency so nothing ships in the initial bundle.

export type ConversionResult = { blob: Blob; filename: string };
export type Converter = (files: File[]) => Promise<ConversionResult>;

export type ConverterConfig = {
  accept: string;
  /** Allow selecting more than one input file (merge, images to PDF). */
  multiple?: boolean;
  run: Converter;
};

function firstFile(files: File[]): File {
  const file = files[0];
  if (!file) throw new Error("Choose a file first.");
  return file;
}

function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([new Uint8Array(bytes).buffer], { type: "application/pdf" });
}

function baseName(name: string) {
  return name.replace(/\.[^./\\]+$/, "");
}

function replaceExtension(name: string, ext: string) {
  return `${baseName(name)}.${ext}`;
}

/** pdf.js 5 uses the not-yet-shipped Map.prototype.getOrInsert* proposal when rendering. */
function polyfillMapGetOrInsert() {
  const proto = Map.prototype as unknown as Record<string, unknown>;
  if (typeof proto["getOrInsert"] !== "function") {
    proto["getOrInsert"] = function <K, V>(this: Map<K, V>, key: K, value: V) {
      if (!this.has(key)) this.set(key, value);
      return this.get(key);
    };
  }
  if (typeof proto["getOrInsertComputed"] !== "function") {
    proto["getOrInsertComputed"] = function <K, V>(this: Map<K, V>, key: K, compute: (k: K) => V) {
      if (!this.has(key)) this.set(key, compute(key));
      return this.get(key);
    };
  }
}

async function loadPdfjs() {
  polyfillMapGetOrInsert();
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  return pdfjs;
}

async function loadPdfDocument(file: File) {
  const { PDFDocument } = await import("pdf-lib");
  return PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
}

async function zipFiles(entries: { name: string; data: Blob | Uint8Array<ArrayBufferLike> }[], filename: string) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const entry of entries) zip.file(entry.name, entry.data);
  const blob = await zip.generateAsync({ type: "blob" });
  return { blob, filename };
}

async function extractPdfPages(file: File): Promise<string[][]> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages: string[][] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = new Map<number, string[]>();

    for (const item of content.items) {
      if (!("str" in item) || item.str.trim() === "") continue;
      // transform[5] is the baseline y; round it so glyphs on one line group together.
      const y = Math.round(item.transform[5] ?? 0);
      const bucket = lines.get(y);
      if (bucket) bucket.push(item.str);
      else lines.set(y, [item.str]);
    }

    pages.push(
      [...lines.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([, parts]) => parts.join(" ").replace(/\s+/g, " ").trim())
        .filter(Boolean),
    );
    page.cleanup();
  }

  await pdf.cleanup();
  return pages;
}

function assertHasText(pages: string[][]) {
  if (pages.every((lines) => lines.length === 0)) {
    throw new Error(
      "This PDF has no extractable text — it looks like a scanned document, which needs OCR.",
    );
  }
}

async function renderPdfToImages(file: File, mime: "image/jpeg" | "image/png", scale = 2) {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const images: { name: string; data: Blob }[] = [];
  const ext = mime === "image/jpeg" ? "jpg" : "png";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser blocked canvas rendering.");
    if (mime === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mime, mime === "image/jpeg" ? 0.92 : undefined),
    );
    if (!blob) throw new Error("Could not encode page image.");
    images.push({ name: `page-${String(pageNumber).padStart(3, "0")}.${ext}`, data: blob });
    page.cleanup();
  }

  await pdf.cleanup();
  return images;
}

/* ------------------------------ converters ------------------------------ */

const pdfToWord: Converter = async (files) => {
  const file = firstFile(files);
  const pages = await extractPdfPages(file);
  assertHasText(pages);

  const { Document, Packer, Paragraph, TextRun } = await import("docx");

  const doc = new Document({
    sections: pages.map((lines, index) => ({
      properties: index === 0 ? {} : { page: {} },
      children: lines.map(
        (line) =>
          new Paragraph({
            spacing: { after: 160 },
            children: [new TextRun({ text: line, font: "Calibri", size: 22 })],
          }),
      ),
    })),
  });

  return { blob: await Packer.toBlob(doc), filename: replaceExtension(file.name, "docx") };
};

const pdfToText: Converter = async (files) => {
  const file = firstFile(files);
  const pages = await extractPdfPages(file);
  const text = pages.map((lines) => lines.join("\n")).join("\n\n");
  return {
    blob: new Blob([text], { type: "text/plain;charset=utf-8" }),
    filename: replaceExtension(file.name, "txt"),
  };
};

const pdfToExcel: Converter = async (files) => {
  const file = firstFile(files);
  const pages = await extractPdfPages(file);
  assertHasText(pages);
  const XLSX = await import("xlsx");

  const workbook = XLSX.utils.book_new();
  pages.forEach((lines, index) => {
    // Split each line on runs of 2+ spaces so column-like layouts land in cells.
    const rows = lines.map((line) => line.split(/\s{2,}/));
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(rows.length ? rows : [[""]]),
      `Page ${index + 1}`,
    );
  });

  const output = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return {
    blob: new Blob([output], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename: replaceExtension(file.name, "xlsx"),
  };
};

const mergePdf: Converter = async (files) => {
  if (files.length < 2) throw new Error("Choose at least two PDF files to merge.");
  const { PDFDocument } = await import("pdf-lib");
  const merged = await PDFDocument.create();

  for (const file of files) {
    const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const bytes = await merged.save();
  return { blob: pdfBlob(bytes), filename: "merged.pdf" };
};

const splitPdf: Converter = async (files) => {
  const file = firstFile(files);
  const { PDFDocument } = await import("pdf-lib");
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const count = source.getPageCount();
  if (count < 2) throw new Error("This PDF has a single page — there is nothing to split.");

  const entries: { name: string; data: Uint8Array }[] = [];
  for (let index = 0; index < count; index++) {
    const single = await PDFDocument.create();
    const [page] = await single.copyPages(source, [index]);
    single.addPage(page);
    entries.push({
      name: `${baseName(file.name)}-page-${String(index + 1).padStart(3, "0")}.pdf`,
      data: await single.save(),
    });
  }

  return zipFiles(entries, `${baseName(file.name)}-pages.zip`);
};

const rotatePdf: Converter = async (files) => {
  const file = firstFile(files);
  const { degrees } = await import("pdf-lib");
  const pdf = await loadPdfDocument(file);
  pdf.getPages().forEach((page) => {
    page.setRotation(degrees((page.getRotation().angle + 90) % 360));
  });
  const bytes = await pdf.save();
  return {
    blob: pdfBlob(bytes),
    filename: `${baseName(file.name)}-rotated.pdf`,
  };
};

const flattenPdf: Converter = async (files) => {
  const file = firstFile(files);
  const pdf = await loadPdfDocument(file);
  try {
    pdf.getForm().flatten();
  } catch {
    // No form fields to flatten — resaving still normalises annotations.
  }
  const bytes = await pdf.save();
  return {
    blob: pdfBlob(bytes),
    filename: `${baseName(file.name)}-flattened.pdf`,
  };
};

const compressPdf: Converter = async (files) => {
  const file = firstFile(files);
  const pdf = await loadPdfDocument(file);
  const bytes = await pdf.save({ useObjectStreams: true });
  return {
    blob: pdfBlob(bytes),
    filename: `${baseName(file.name)}-compressed.pdf`,
  };
};

const repairPdf: Converter = async (files) => {
  const file = firstFile(files);
  const { PDFDocument } = await import("pdf-lib");
  const source = await loadPdfDocument(file);
  const rebuilt = await PDFDocument.create();
  const pages = await rebuilt.copyPages(source, source.getPageIndices());
  pages.forEach((page) => rebuilt.addPage(page));
  const bytes = await rebuilt.save();
  return {
    blob: pdfBlob(bytes),
    filename: `${baseName(file.name)}-repaired.pdf`,
  };
};

const unlockPdf: Converter = async (files) => {
  const file = firstFile(files);
  const { PDFDocument } = await import("pdf-lib");
  const source = await loadPdfDocument(file);
  const clean = await PDFDocument.create();
  const pages = await clean.copyPages(source, source.getPageIndices());
  pages.forEach((page) => clean.addPage(page));
  const bytes = await clean.save();
  return {
    blob: pdfBlob(bytes),
    filename: `${baseName(file.name)}-unlocked.pdf`,
  };
};

const imagesToPdf: Converter = async (files) => {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const isPng = file.type === "image/png" || /\.png$/i.test(file.name);
    const image = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }

  const bytes = await pdf.save();
  return {
    blob: pdfBlob(bytes),
    filename:
      files.length === 1 && files[0] ? replaceExtension(files[0].name, "pdf") : "images.pdf",
  };
};

const pdfToImages =
  (mime: "image/jpeg" | "image/png"): Converter =>
  async (files) => {
    const file = firstFile(files);
    const images = await renderPdfToImages(file, mime);
    const single = images[0];
    if (images.length === 1 && single) {
      return {
        blob: single.data,
        filename: replaceExtension(file.name, mime === "image/jpeg" ? "jpg" : "png"),
      };
    }
    return zipFiles(images, `${baseName(file.name)}-${mime === "image/jpeg" ? "jpg" : "png"}.zip`);
  };

const PDF_ACCEPT = "application/pdf,.pdf";
const IMAGE_ACCEPT = "image/jpeg,image/png,.jpg,.jpeg,.png";

const converters: Record<string, ConverterConfig> = {
  "pdf-to-word": { accept: PDF_ACCEPT, run: pdfToWord },
  "pdf-to-text": { accept: PDF_ACCEPT, run: pdfToText },
  "pdf-to-excel": { accept: PDF_ACCEPT, run: pdfToExcel },
  "pdf-to-jpg": { accept: PDF_ACCEPT, run: pdfToImages("image/jpeg") },
  "pdf-to-png": { accept: PDF_ACCEPT, run: pdfToImages("image/png") },
  "jpg-to-pdf": { accept: IMAGE_ACCEPT, multiple: true, run: imagesToPdf },
  "merge-pdf": { accept: PDF_ACCEPT, multiple: true, run: mergePdf },
  "split-pdf": { accept: PDF_ACCEPT, run: splitPdf },
  "rotate-pdf": { accept: PDF_ACCEPT, run: rotatePdf },
  "flatten-pdf": { accept: PDF_ACCEPT, run: flattenPdf },
  "compress-pdf": { accept: PDF_ACCEPT, run: compressPdf },
  "repair-pdf": { accept: PDF_ACCEPT, run: repairPdf },
  "unlock-pdf": { accept: PDF_ACCEPT, run: unlockPdf },
};

export function getConverter(slug: string | undefined) {
  return slug ? converters[slug] : undefined;
}
