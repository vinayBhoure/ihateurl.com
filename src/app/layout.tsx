import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { env } from "@/config/env";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// Plan 2 §5.2. `/og.png` is the single default image (FD5, added in F4.5).
export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: { default: "ihateurl", template: "%s · ihateurl" },
  description:
    "Save URLs into collections, keep them private, publish the ones you choose at ihateurl.com/u/you/collection.",
  openGraph: { type: "website", siteName: "ihateurl", images: ["/og.png"] },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ClerkProvider afterSignOutUrl="/" appearance={clerkAppearance}>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn("h-full antialiased", geistSans.variable, geistMono.variable)}
      >
        <body className="min-h-full flex flex-col font-sans">
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster position="top-center" closeButton />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
