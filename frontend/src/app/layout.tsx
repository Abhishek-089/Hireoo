import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hireoo - AI-Powered Job Search Automation",
    template: "%s | Hireoo"
  },
  description: "Automate your job search with AI-powered job discovery and personalized cold emailing. Connect your Gmail, install our Chrome extension, and land your dream job faster.",
  keywords: "Hireoo, job search, automation, cold email, AI matching, recruitment, career, job discovery, AI job assistant",
  authors: [{ name: "Hireoo Team" }],
  openGraph: {
    title: "Hireoo - AI-Powered Job Search Automation",
    description: "Automate your job search with AI-powered job discovery and personalized cold emailing.",
    url: siteUrl,
    siteName: "Hireoo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hireoo - AI-Powered Job Search Automation",
    description: "Automate your job search with AI-powered job discovery and personalized cold emailing.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
