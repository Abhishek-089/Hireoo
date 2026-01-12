import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Hireoo",
  description: "Read Hireoo's Terms of Service and understand the rules for using our AI-powered job search automation platform.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">Last updated: December 16, 2024</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing or using Hireoo's AI-powered job search automation platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Hireoo provides an automated job search platform that includes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Chrome extension for LinkedIn job scraping</li>
              <li>AI-powered job matching and analysis</li>
              <li>Automated cold email generation and sending via Gmail</li>
              <li>Dashboard for tracking applications and responses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>

            <h3 className="text-xl font-medium text-gray-900 mb-3">3.1 Account Creation</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use our Service, you must create an account and provide accurate, complete information. You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">3.2 Gmail Integration</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Service requires Gmail integration via OAuth. You authorize us to send emails on your behalf and read responses. We never store your Gmail password.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Use the Service for illegal purposes or to send spam</li>
              <li>Violate LinkedIn's terms of service</li>
              <li>Send harassing, abusive, or discriminatory content</li>
              <li>Attempt to reverse engineer or copy our technology</li>
              <li>Share your account credentials with others</li>
              <li>Exceed reasonable usage limits that may harm our systems</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Subscription and Billing</h2>

            <h3 className="text-xl font-medium text-gray-900 mb-3">5.1 Free Trial</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We offer a free trial period. You can cancel anytime during the trial without charges.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">5.2 Payment Terms</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Subscription fees are billed in advance. You can cancel your subscription at any time, but refunds are provided only within 30 days of purchase.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">5.3 Price Changes</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may change pricing with 30 days notice. Price changes won't affect current billing periods.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service and its original content, features, and functionality are owned by Hireoo and are protected by copyright, trademark, and other intellectual property laws. You retain ownership of your content but grant us a license to use it for providing the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may terminate or suspend your account immediately for violations of these Terms. You can terminate your account at any time. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service is provided "as is" without warranties. We do not guarantee job placement or specific results. We are not responsible for third-party services like LinkedIn or Gmail.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim. We are not liable for indirect damages or lost opportunities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree to indemnify and hold us harmless from any claims arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms are governed by the laws of California, USA. Any disputes will be resolved in the courts of San Francisco County, California.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may modify these Terms at any time. We will notify users of material changes. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions about these Terms, contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> legal@hireoo.com</p>
              <p className="text-gray-700"><strong>Address:</strong> 123 Innovation Drive, San Francisco, CA 94103</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
