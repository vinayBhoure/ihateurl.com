import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// Placeholder; F2.1 adds metadataBase, title template, Open Graph and Twitter defaults.
export const metadata: Metadata = {
  title: "ihateurl",
  description: "Save URLs into collections, keep them private, and publish the ones you choose.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html
        lang="en"
        suppressHydrationWarning
        className={cn("h-full antialiased", geistSans.variable, geistMono.variable)}
      >
        <body className="min-h-full flex flex-col font-sans">
          <ThemeProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
