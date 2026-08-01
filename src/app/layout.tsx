import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Free PDF Converter",
  description: "Convert to and from PDF online for free.",
  authors: [{ name: "Lovable" }],
  openGraph: {
    title: "Free PDF Converter",
    description: "Convert to and from PDF online for free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Lovable",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={lato.variable}>
      <body>{children}</body>
    </html>
  );
}
