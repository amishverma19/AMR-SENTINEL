import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AMR Sentinel — Hack for Social Cause (Yuva Bharat) | Clinical Stewardship Platform",
  description:
    "AI-augmented point-of-care antimicrobial resistance auditing and stewardship platform for Hack for Social Cause (Yuva Bharat / Viksit Bharat @2047), grounded in ICMR STG and WHO AWaRe Framework.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="antialiased font-sans bg-[#F1F8FC] text-slate-900">
        <TooltipProvider delay={200}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
