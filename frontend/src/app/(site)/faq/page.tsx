'use client'

import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, HelpCircle } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    question: "What is Hireoo and how does it work?",
    answer: "Hireoo is an AI-powered job search automation platform that scrapes LinkedIn hiring posts, matches them with your profile, and sends personalized cold emails through your Gmail account. Simply install our Chrome extension, connect your Gmail, and let AI do the work."
  },
  {
    question: "Is my Gmail data secure?",
    answer: "Absolutely. We use Google OAuth 2.0 for secure authentication, which means we never store your Gmail password. We only access the specific permissions needed for sending emails and reading responses. All data is encrypted and GDPR compliant."
  },
  {
    question: "Do I need technical skills to use Hireoo?",
    answer: "Not at all! Our platform is designed to be user-friendly. Installation takes less than 5 minutes, and our AI handles all the complex matching and email generation. Just upload your resume and set your preferences."
  },
  {
    question: "Can I customize the cold emails?",
    answer: "Yes! While our AI generates personalized emails based on your profile and the job posting, you can edit, customize, or create your own email templates. Professional plan and above include advanced customization options."
  },
  {
    question: "What happens if I get a response to a cold email?",
    answer: "Great question! Hireoo tracks all email responses and notifies you instantly. You can view conversations in your dashboard and continue the conversation directly in Gmail. We also provide analytics on response rates and engagement."
  },
  {
    question: "Is there a limit to how many jobs I can apply to?",
    answer: "Our Starter plan allows up to 50 applications per month. Professional and Enterprise plans have unlimited applications. We recommend quality over quantity - our AI ensures you only apply to highly relevant positions."
  },
  {
    question: "Can I pause or stop the automation anytime?",
    answer: "Yes, you have full control. You can pause email sending, modify your search criteria, or completely stop the automation at any time through your dashboard. No long-term commitments required."
  },
  {
    question: "What if the AI sends emails I don't like?",
    answer: "You can review and approve all emails before they're sent. Our Professional plan includes an approval workflow where you can review AI-generated emails before they're sent to ensure they match your voice and preferences."
  },
  {
    question: "Do you guarantee job offers?",
    answer: "While we can't guarantee job offers (no automation tool can), our users typically see 3x more interview responses and land jobs 60% faster. We focus on quality matches and professional outreach that gets results."
  },
  {
    question: "What browsers and devices are supported?",
    answer: "Our Chrome extension works on all modern versions of Google Chrome and Chromium-based browsers (Edge, Brave, etc.). The web dashboard works on all modern browsers and devices including mobile."
  },
  {
    question: "Can I use Hireoo for multiple job searches?",
    answer: "Yes! You can create multiple campaigns for different types of roles, industries, or locations. Each campaign can have its own settings, email templates, and targeting criteria."
  },
  {
    question: "What if LinkedIn changes their layout?",
    answer: "Our team monitors LinkedIn changes and updates our scraping technology accordingly. We use robust selectors and AI-powered content recognition to ensure reliable scraping even when layouts change."
  }
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900 pr-4">{question}</h3>
          <ChevronDown className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-600 leading-relaxed">{answer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Everything you need to know about Hireoo and how it can transform your job search.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>

      {/* Still Need Help Section */}
      <div className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <HelpCircle className="mx-auto h-16 w-16 text-blue-600 mb-6" />
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Still Need Help?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/how-it-works"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                How It Works
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
