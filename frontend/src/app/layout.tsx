import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";

const inter = Inter({
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hireoo – Auto Apply Job Website | Automate Job Applications",
    template: "%s | Hireoo"
  },
  description: "Hireoo is India's #1 auto apply job website. Automate job applications with one-click apply — AI matches fresh jobs every hour and applies on your behalf via Gmail. Access hidden jobs others never see.",
  keywords: [
    "auto apply job website",
    "automate job applications",
    "one click apply jobs",
    "apply job in one click",
    "hidden jobs",
    "automated job search India",
    "AI job application automation",
    "bulk apply jobs",
    "job search automation",
    "apply to multiple jobs at once",
    "one click job apply",
    "automatic job application",
    "job apply automation India",
    "AI job matching",
    "find hidden jobs",
  ],
  authors: [{ name: "Hireoo Team" }],
  openGraph: {
    title: "Hireoo – Auto Apply Job Website | Automate Job Applications",
    description: "India's #1 auto apply job website. One-click apply to matched jobs, automate applications via Gmail, and access hidden jobs others miss.",
    url: siteUrl,
    siteName: "Hireoo",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hireoo – Auto Apply Job Website",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hireoo – Auto Apply Job Website | Automate Job Applications",
    description: "India's #1 auto apply job website. One-click apply to matched jobs and automate your entire job search via Gmail.",
    images: ["/og-image.png"],
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
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
