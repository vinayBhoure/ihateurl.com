import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vinay Bhoure — Full-Stack Starter Kit",
  description:
    "A Next.js + Tailwind + shadcn + Zod + Prisma starter kit, ready for PostgreSQL or MongoDB.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className="h-full antialiased">
        <body className="min-h-full flex flex-col font-sans">
          {children}
          <Toaster position="top-center" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
