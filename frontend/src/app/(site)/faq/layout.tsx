import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "FAQ – Auto Apply Jobs, One Click Apply & Hidden Jobs Explained",
    description: "Answers to common questions about Hireoo's auto apply job website — how to automate job applications, one-click apply via Gmail, find hidden jobs, bulk apply, and pricing.",
    alternates: {
        canonical: "/faq",
    },
    openGraph: {
        title: "FAQ – Auto Apply Jobs, One Click Apply & Hidden Jobs | Hireoo",
        description: "Everything you need to know about automating job applications, one-click apply, and finding hidden jobs with Hireoo.",
        url: "https://www.hireoo.in/faq",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Hireoo FAQ" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "FAQ – Auto Apply Jobs & One Click Apply | Hireoo",
        description: "Everything about automating job applications and one-click apply with Hireoo.",
        images: ["/og-image.png"],
    },
}

export default function FAQLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
