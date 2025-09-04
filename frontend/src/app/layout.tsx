import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Seek - Privacy-First CV Analysis",
  description:
    "Analyze your CV and generate cover letters with local AI processing. Your data stays private.",
  keywords: ["CV analysis", "resume review", "cover letter", "privacy", "AI"],
  authors: [{ name: "Job Seek" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Job Seek - Privacy-First CV Analysis",
    description:
      "Analyze your CV and generate cover letters with local AI processing.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-full">{children}</div>
      </body>
    </html>
  );
}
