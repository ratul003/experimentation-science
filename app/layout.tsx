import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Experimentation Science Framework",
  description:
    "Statistical rigour for A/B testing at scale — defining what makes an experiment trustworthy across 3.6 million experiments. A case study by Wahid Tawsif Ratul, Product Analytics Engineer at Optimizely.",
  openGraph: {
    title: "Experimentation Science Framework",
    description:
      "Statistical rigour for A/B testing at scale — defining what makes an experiment trustworthy across 3.6 million experiments.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
