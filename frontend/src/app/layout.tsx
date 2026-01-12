import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hireoo - AI-Powered Job Search Automation",
  description: "Automate your job search with AI-powered LinkedIn scraping and personalized cold emailing. Connect your Gmail, install our Chrome extension, and land your dream job faster.",
  keywords: "job search, LinkedIn automation, cold email, AI matching, recruitment, career",
  authors: [{ name: "Hireoo Team" }],
  openGraph: {
    title: "Hireoo - AI-Powered Job Search Automation",
    description: "Automate your job search with AI-powered LinkedIn scraping and personalized cold emailing.",
    url: "https://hireoo.com",
    siteName: "Hireoo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hireoo - AI-Powered Job Search Automation",
    description: "Automate your job search with AI-powered LinkedIn scraping and personalized cold emailing.",
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
