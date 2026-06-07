import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://experimentation-science.vercel.app"),
  title: "Running Meaningful Experiments",
  description:
    "Statistical rigour for A/B testing at scale: designing experiments that prove things, across MVT interaction effects, causal inference, and AI-accelerated execution.",
  openGraph: {
    title: "Running Meaningful Experiments",
    description:
      "Statistical rigour for A/B testing at scale: defining what makes an experiment trustworthy across 3.6 million experiments.",
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
