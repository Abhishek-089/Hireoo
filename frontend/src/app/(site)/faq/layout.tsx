import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Frequently Asked Questions",
    description: "Find answers to commonly asked questions about Hireoo, our AI job search automation, security, and pricing.",
    alternates: {
        canonical: "/faq",
    },
}

export default function FAQLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
